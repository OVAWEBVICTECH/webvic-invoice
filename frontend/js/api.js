/* ================================================================== */
/*  api.js — Backend REST API Client (JWT with httpOnly cookies)      */
/* ================================================================== */

window.Backend = {
  baseUrl: 'http://localhost:8080',

  request: async function(path, opts) {
    opts = opts || {};
    const url = this.baseUrl.replace(/\/$/, '') + path;
    
    try {
      const res = await fetch(url, {
        method: opts.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send and receive cookies
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
      });

      const ct = res.headers.get('content-type') || '';
      const data = ct.indexOf('application/json') >= 0 
        ? await res.json().catch(() => ({})) 
        : {};

      if (!res.ok) {
        const err = new Error(data.error || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }

      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  health: function() {
    return this.request('/health');
  },

  // Auth Endpoints
  signup: function(name, email, password, businessName) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password, businessName }
    });
  },

  login: function(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  logout: function() {
    return this.request('/api/auth/logout', { method: 'POST' });
  },

  me: function() {
    return this.request('/api/auth/me');
  },

  refresh: function() {
    return this.request('/api/auth/refresh', { method: 'POST' });
  },

  // Clients Endpoints
  getClients: function() {
    return this.request('/api/clients');
  },

  createClient: function(client) {
    return this.request('/api/clients', {
      method: 'POST',
      body: client
    });
  },

  updateClient: function(id, client) {
    return this.request(`/api/clients/${id}`, {
      method: 'PUT',
      body: client
    });
  },

  deleteClient: function(id) {
    return this.request(`/api/clients/${id}`, { method: 'DELETE' });
  },

  // Invoices Endpoints
  getInvoices: function() {
    return this.request('/api/invoices');
  },

  getInvoice: function(id) {
    return this.request(`/api/invoices/${id}`);
  },

  createInvoice: function(invoice) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: invoice
    });
  },

  updateInvoiceStatus: function(id, status) {
    return this.request(`/api/invoices/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
  },

  deleteInvoice: function(id) {
    return this.request(`/api/invoices/${id}`, { method: 'DELETE' });
  },

  // Settings Endpoints
  getSettings: function() {
    return this.request('/api/settings');
  },

  updateSettings: function(settings) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: settings
    });
  }
};

// Load backend URL from localStorage if set
const savedBaseUrl = localStorage.getItem('if_backend_baseUrl');
if (savedBaseUrl) {
  Backend.baseUrl = savedBaseUrl;
}
