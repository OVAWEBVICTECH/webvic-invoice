const baseUrl = (process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '');
const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = 'InvoiceFlow!2345';
const user = {
  name: 'Smoke Test User',
  email: `smoke-${stamp}@example.com`,
  password,
  businessName: 'Smoke Test Co'
};

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${data.error || res.statusText}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log(`Running auth persistence smoke test against ${baseUrl}`);

const signup = await request('/api/auth/signup', { method: 'POST', body: user });
assert(signup.user?.email === user.email, 'Signup did not return the created user');
assert(signup.token, 'Signup did not return a JWT token');

const tokenA = signup.token;
const clientBody = {
  name: 'Cross Device Client',
  email: `client-${stamp}@example.com`,
  company: 'Client Co',
  phone: '+15555550123'
};
const client = (await request('/api/clients', { method: 'POST', token: tokenA, body: clientBody })).client;
assert(client?.id, 'Client create did not return an id');

const settings = (await request('/api/settings', {
  method: 'PUT',
  token: tokenA,
  body: { address: '123 Persistence Ave', paymentTerms: 14 }
})).settings;
assert(settings?.paymentTerms === 14, 'Settings update did not persist payment terms');

const invoice = (await request('/api/invoices', {
  method: 'POST',
  token: tokenA,
  body: {
    number: `SMOKE-${stamp}`.slice(0, 40),
    clientId: client.id,
    dueDate: '2026-07-01',
    notes: 'Created by auth persistence smoke test',
    items: [{ description: 'Persistence verification', qty: 2, price: 125.5 }]
  }
})).invoice;
assert(invoice?.id && Number(invoice.total) === 251, 'Invoice create did not persist expected total');

await request('/api/auth/logout', { method: 'POST', token: tokenA });

const login = await request('/api/auth/login', { method: 'POST', body: { email: user.email, password } });
assert(login.user?.id === signup.user.id, 'Second-device login did not return the same user');
assert(login.token && login.token !== tokenA, 'Second-device login did not return a fresh JWT token');

const tokenB = login.token;
const [clients, invoices, reloadedSettings] = await Promise.all([
  request('/api/clients', { token: tokenB }),
  request('/api/invoices', { token: tokenB }),
  request('/api/settings', { token: tokenB })
]);

assert(clients.clients.some(c => c.id === client.id && c.email === client.email), 'Client was not visible after second-device login');
assert(invoices.invoices.some(i => i.id === invoice.id && i.number === invoice.number && Number(i.total) === 251), 'Invoice was not visible after second-device login');
assert(reloadedSettings.settings?.paymentTerms === 14, 'Settings were not visible after second-device login');

console.log('Auth persistence smoke test passed. Register, login, logout, second-device login, and data reload all succeeded.');
