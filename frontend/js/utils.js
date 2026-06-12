/* ================================================================== */
/*  utils.js — Security, Storage, Formatting, PDF utilities           */
/* ================================================================== */

/* ---------- Security ---------- */
window.Security = {
    sanitize: function(s) {
        if (!s) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    },

    csrfToken: function() {
        var a = new Uint8Array(32);
        crypto.getRandomValues(a);
        return Array.from(a, function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    },

    secureId: function(prefix) {
        prefix = prefix || 'id';
        var a = new Uint8Array(16);
        crypto.getRandomValues(a);
        return prefix + '_' + Array.from(a, function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    },

    validEmail: function(e) {
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(e.toLowerCase());
    },

    strength: function(pw) {
        var s = 0;
        if (pw.length >= 8) s++;
        if (pw.length >= 12) s++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
        if (/\d/.test(pw)) s++;
        if (/[^a-zA-Z0-9]/.test(pw)) s++;
        return s;
    },

    password: {
        iter: 150000,
        bits: 256,

        derive: async function(pw, salt) {
            var e = new TextEncoder();
            var k = await crypto.subtle.importKey('raw', e.encode(pw), { name: 'PBKDF2' }, false, ['deriveBits']);
            var b = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: this.iter, hash: 'SHA-256' }, k, this.bits);
            return new Uint8Array(b);
        },

        hex: function(b) {
            return Array.from(b).map(function(x) { return x.toString(16).padStart(2, '0'); }).join('');
        },

        unhex: function(h) {
            var o = new Uint8Array(h.length / 2);
            for (var i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16);
            return o;
        },

        hash: async function(pw) {
            var s = new Uint8Array(16);
            crypto.getRandomValues(s);
            var d = await this.derive(pw, s);
            return { algo: 'pbkdf2_sha256', iterations: this.iter, saltHex: this.hex(s), hashHex: this.hex(d) };
        },

        verify: async function(pw, rec) {
            if (!rec || rec.algo !== 'pbkdf2_sha256') return false;
            var s = this.unhex(rec.saltHex);
            var d = await this.derive(pw, s);
            return this.hex(d) === rec.hashHex;
        }
    },

    rateLimiter: {
        attempts: {},
        max: 5,
        windowMs: 300000,

        check: function(k) {
            var n = Date.now();
            if (!this.attempts[k]) this.attempts[k] = { count: 0, first: n };
            if (n - this.attempts[k].first > this.windowMs) this.attempts[k] = { count: 0, first: n };
            return this.attempts[k].count < this.max;
        },

        inc: function(k) {
            if (!this.attempts[k]) this.attempts[k] = { count: 0, first: Date.now() };
            this.attempts[k].count++;
        },

        reset: function(k) { delete this.attempts[k]; },

        remaining: function(k) {
            if (!this.attempts[k]) return 0;
            return Math.max(0, Math.ceil((this.windowMs - (Date.now() - this.attempts[k].first)) / 1000));
        }
    }
};

/* ---------- Storage ---------- */
window.Storage = {
    save: function(data) {
        try { localStorage.setItem('invoiceFlowData', btoa(JSON.stringify(data))); } catch (e) { }
    },
    load: function() {
        try {
            var s = localStorage.getItem('invoiceFlowData');
            return s ? JSON.parse(atob(s)) : null;
        } catch (e) {
            localStorage.removeItem('invoiceFlowData');
            return null;
        }
    }
};

/* ---------- Formatters ---------- */
window.fmt = {
    currency: function(a) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a);
    },
    date: function(d) {
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

/* ---------- PDF Generator ---------- */
window.PDF = {
    inProgress: false,

    busy: function(v) {
        var el = document.getElementById('pdfBusy');
        if (!el) return;
        el.classList.toggle('hidden', !v);
        el.classList.toggle('flex', v);
    },

    begin: function() {
        if (this.inProgress) return false;
        this.inProgress = true;
        var m = document.getElementById('pdfMount');
        if (m) m.classList.add('pdf-rendering');
        try { window.scrollTo(0, 0); } catch (e) { }
        this.busy(true);
        return true;
    },

    end: function() {
        var m = document.getElementById('pdfMount');
        if (m) m.classList.remove('pdf-rendering');
        var p = document.getElementById('pdfInvoice');
        if (p) { p.innerHTML = ''; p.style.cssText = 'padding:56px;'; }
        this.busy(false);
        this.inProgress = false;
    },

    badgeClass: function(s) {
        if (s === 'paid') return 'pdf-badge pdf-badge-paid';
        if (s === 'overdue') return 'pdf-badge pdf-badge-overdue';
        return 'pdf-badge pdf-badge-pending';
    },

    scale: function() {
        var dm = navigator.deviceMemory || 0;
        var mob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        return (dm && dm <= 2) || mob ? 1.3 : 1.6;
    },

    buildHtml: function(inv, user, settings) {
        var ub = Security.sanitize(settings.business || (user && user.business) || (user && user.name) || 'InvoiceFlow User');
        var ue = Security.sanitize((user && user.email) || '');
        var cn = Security.sanitize(inv.clientName || 'Client');
        var ce = Security.sanitize(inv.clientEmail || '');
        var cc = Security.sanitize(inv.clientCompany || '');
        var num = Security.sanitize(inv.number || 'INV');
        var due = inv.dueDate ? fmt.date(inv.dueDate) : '';
        var created = inv.createdAt ? fmt.date(inv.createdAt) : '';
        var status = Security.sanitize(inv.status || 'pending');
        var notes = Security.sanitize(inv.notes || '');

        var items = (inv.items || []).map(function(it) {
            var d = Security.sanitize(it.desc || it.description || '');
            var q = Number(it.qty || 0);
            var p = Number(it.price || 0);
            var st = Number(it.subtotal || (q * p));
            return '<tr><td style="width:55%"><div class="pdf-h3">' + (d || 'Item') + '</div></td><td style="width:15%;text-align:right" class="pdf-muted">' + q + '</td><td style="width:15%;text-align:right" class="pdf-muted">' + fmt.currency(p) + '</td><td style="width:15%;text-align:right;font-weight:700">' + fmt.currency(st) + '</td></tr>';
        }).join('');

        var issuedHtml = created ? '<div><span class="pdf-muted">Issued:</span> <strong>' + created + '</strong></div>' : '';
        var dueHtml = due ? '<div style="margin-top:4px"><span class="pdf-muted">Due:</span> <strong>' + due + '</strong></div>' : '';
        var companyHtml = cc ? '<div class="pdf-muted pdf-small" style="margin-top:2px">' + cc + '</div>' : '';
        var emailHtml = ce ? '<div class="pdf-muted pdf-small" style="margin-top:6px">' + ce + '</div>' : '';
        var notesHtml = notes ? '<div style="margin-top:22px"><div class="pdf-muted pdf-small" style="font-weight:700">Notes</div><div class="pdf-muted" style="margin-top:6px;white-space:pre-wrap">' + notes + '</div></div>' : '';

        return '<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start">'
            + '<div><div class="pdf-h2" style="background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;background-clip:text;color:transparent">INVOICE</div>'
            + '<div class="pdf-muted pdf-small" style="margin-top:6px">Invoice <strong>#' + num + '</strong></div>'
            + '<div style="margin-top:10px" class="' + this.badgeClass(status) + '">' + status.toUpperCase() + '</div></div>'
            + '<div style="text-align:right;max-width:55%"><div style="font-weight:800;font-size:16px">' + ub + '</div>'
            + '<div class="pdf-muted pdf-small" style="margin-top:4px">' + ue + '</div>'
            + '<div class="pdf-muted pdf-small" style="margin-top:10px">' + issuedHtml + ' ' + dueHtml + '</div></div></div>'
            + '<div style="height:1px;background:#e2e8f0;margin:22px 0"></div>'
            + '<div style="display:flex;justify-content:space-between;gap:24px"><div style="flex:1">'
            + '<div class="pdf-muted pdf-small">Bill To</div>'
            + '<div style="font-weight:800;font-size:15px;margin-top:6px">' + cn + '</div>' + companyHtml + ' ' + emailHtml + '</div>'
            + '<div style="width:280px;border:1px solid #e2e8f0;border-radius:14px;padding:14px">'
            + '<div class="pdf-muted pdf-small">Total</div>'
            + '<div style="font-size:28px;font-weight:900;margin-top:6px">' + fmt.currency(Number(inv.total || 0)) + '</div>'
            + '<div class="pdf-muted pdf-small" style="margin-top:6px">Thank you for your business.</div></div></div>'
            + '<div style="margin-top:24px"><table class="pdf-table"><thead><tr>'
            + '<th class="pdf-muted pdf-small" style="text-align:left">Description</th>'
            + '<th class="pdf-muted pdf-small" style="text-align:right">Qty</th>'
            + '<th class="pdf-muted pdf-small" style="text-align:right">Price</th>'
            + '<th class="pdf-muted pdf-small" style="text-align:right">Amount</th>'
            + '</tr></thead><tbody>' + (items || '<tr><td colspan="4" class="pdf-muted pdf-small">No items</td></tr>') + '</tbody></table></div>'
            + notesHtml
            + '<div style="position:absolute;left:56px;right:56px;bottom:38px">'
            + '<div style="height:1px;background:#e2e8f0;margin-bottom:12px"></div>'
            + '<div class="pdf-muted pdf-small" style="display:flex;justify-content:space-between;gap:12px">'
            + '<div>Generated by InvoiceFlow</div><div>' + new Date().toLocaleString() + '</div></div></div>';
    },

    render: async function(inv, user, settings) {
        if (!this.begin()) return;
        try {
            var mount = document.getElementById('pdfInvoice');
            if (!mount) throw new Error('PDF mount not found');
            mount.style.cssText = 'padding:56px;position:relative;left:0;top:0;margin:0;transform:none;box-sizing:border-box;width:794px;height:1123px;min-height:1123px;overflow:hidden;';
            mount.innerHTML = this.buildHtml(inv, user, settings);

            try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { }
            await new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
            await new Promise(function(r) { setTimeout(r, 120); });

            var sc = this.scale();
            var pw = 794;
            var ph = 1123;
            var canvas = await html2canvas(mount, {
                scale: sc, useCORS: true, backgroundColor: '#ffffff',
                windowWidth: pw, windowHeight: ph,
                scrollX: 0, scrollY: 0, x: 0, y: 0,
                width: pw, height: ph, logging: false
            });

            var img = canvas.toDataURL('image/png');
            var jsPDFLib = window.jspdf;
            var pdf = new jsPDFLib.jsPDF({ orientation: 'portrait', unit: 'px', format: [pw, ph], compress: true });
            var inset = 10;
            var dw = pw - inset;
            var ratio = dw / pw;
            var dh = ph * ratio;
            pdf.addImage(img, 'PNG', 0, 0, dw, dh);
            var filename = (inv.number || 'invoice').replace(/[^a-zA-Z0-9_-]+/g, '_') + '.pdf';
            pdf.save(filename);
        } catch (e) {
            throw e;
        } finally {
            this.end();
        }
    }
};
