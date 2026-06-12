/* ================================================================== */
/*  api.js — Backend REST API Client                                  */
/* ================================================================== */

window.Backend = {
    enabled: false,
    baseUrl: 'http://localhost:8080',

    loadPrefs: function() {
        try {
            this.enabled = localStorage.getItem('if_backend_enabled') === 'true';
            this.baseUrl = localStorage.getItem('if_backend_baseUrl') || this.baseUrl;
        } catch (e) { }
    },

    savePrefs: function() {
        try {
            localStorage.setItem('if_backend_enabled', String(this.enabled));
            localStorage.setItem('if_backend_baseUrl', String(this.baseUrl));
        } catch (e) { }
    },

    request: async function(path, opts) {
        opts = opts || {};
        var url = this.baseUrl.replace(/\/$/, '') + path;
        var res = await fetch(url, {
            method: opts.method || 'GET',
            headers: { 'Content-Type': 'application/json' },
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

    health: async function() {
        return this.request('/health');
    }
};

Backend.loadPrefs();
