/* ================================================================== */
/*  api.js — Backend REST API Client                                  */
/* ================================================================== */

window.Backend = {
    enabled: true,
    baseUrl: (window.INVOICEFLOW_API_URL || '').replace(/\/$/, '') || 'http://localhost:8080',
    token: null,

    setToken: function(token) {
        this.token = token || null;
    },

    request: async function(path, opts) {
        opts = opts || {};
        var url = this.baseUrl.replace(/\/$/, '') + path;
        var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
        if (this.token) headers.Authorization = 'Bearer ' + this.token;

        var res = await fetch(url, {
            method: opts.method || 'GET',
            headers: headers,
            credentials: 'include',
            body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
        });
        var ct = res.headers.get('content-type') || '';
        var data = ct.indexOf('application/json') >= 0 ? await res.json().catch(function() { return {}; }) : {};
        if (!res.ok) {
            var err = new Error(data.error || 'Request failed');
            err.status = res.status;
            throw err;
        }
        return data;
    },

    normalizeInvoice: function(inv) {
        var items = (inv.items || []).map(function(it) {
            return Object.assign({}, it, {
                desc: it.desc || it.description,
                price: Number(it.price || 0),
                subtotal: Number(it.subtotal || 0)
            });
        });
        return Object.assign({}, inv, {
            total: Number(inv.total || 0),
            clientName: inv.clientName || (inv.client && inv.client.name) || '',
            clientEmail: inv.clientEmail || (inv.client && inv.client.email) || '',
            items: items
        });
    },

    health: async function() { return this.request('/health'); },

    auth: {
        signup: async function(body) { return Backend.request('/api/auth/signup', { method: 'POST', body: body }); },
        login: async function(body) { return Backend.request('/api/auth/login', { method: 'POST', body: body }); },
        logout: async function() { return Backend.request('/api/auth/logout', { method: 'POST' }); },
        me: async function() { return Backend.request('/api/auth/me'); },
        profile: async function(body) { return Backend.request('/api/auth/profile', { method: 'PUT', body: body }); }
    },

    clients: {
        list: async function() { return Backend.request('/api/clients'); },
        create: async function(body) { return Backend.request('/api/clients', { method: 'POST', body: body }); },
        update: async function(id, body) { return Backend.request('/api/clients/' + encodeURIComponent(id), { method: 'PUT', body: body }); },
        delete: async function(id) { return Backend.request('/api/clients/' + encodeURIComponent(id), { method: 'DELETE' }); }
    },

    invoices: {
        list: async function() {
            var res = await Backend.request('/api/invoices');
            res.invoices = (res.invoices || []).map(Backend.normalizeInvoice);
            return res;
        },
        create: async function(body) {
            var res = await Backend.request('/api/invoices', { method: 'POST', body: body });
            res.invoice = Backend.normalizeInvoice(res.invoice);
            return res;
        },
        markPaid: async function(id) {
            var res = await Backend.request('/api/invoices/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: { status: 'paid' } });
            res.invoice = Backend.normalizeInvoice(res.invoice);
            return res;
        },
        delete: async function(id) { return Backend.request('/api/invoices/' + encodeURIComponent(id), { method: 'DELETE' }); }
    },

    settings: {
        get: async function() { return Backend.request('/api/settings'); },
        update: async function(body) { return Backend.request('/api/settings', { method: 'PUT', body: body }); }
    }
};
