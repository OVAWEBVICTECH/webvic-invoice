/* ================================================================== */
/*  pages/Dashboard.js — Full Dashboard Page                          */
/*  Overview, Invoices, Clients, Create Invoice, Settings             */
/* ================================================================== */

window.DashboardPage = function() {
    var app = useApp();
    var u = app.user;
    if (!u) return null;

    var firstName = Security.sanitize(u.name.split(' ')[0]);
    var totalRev = app.invoices.filter(function(i) { return i.status === 'paid'; }).reduce(function(s, i) { return s + i.total; }, 0);
    var pending = app.invoices.filter(function(i) { return i.status === 'pending'; });
    var pendingAmt = pending.reduce(function(s, i) { return s + i.total; }, 0);

    var statusCls = {
        paid: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
        pending: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
        overdue: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
    };

    /* ---- Client Modal State ---- */
    var _cm = React.useState(false); var clientModal = _cm[0], setClientModal = _cm[1];
    var _cn = React.useState(''); var cn = _cn[0], setCn = _cn[1];
    var _ce = React.useState(''); var ce = _ce[0], setCe = _ce[1];
    var _cc = React.useState(''); var cc = _cc[0], setCc = _cc[1];
    var _cp = React.useState(''); var cp = _cp[0], setCp = _cp[1];

    var addClient = function(e) {
        e.preventDefault();
        var nm = Security.sanitize(cn.trim()), em = Security.sanitize(ce.trim().toLowerCase()), co = Security.sanitize(cc.trim()), ph = Security.sanitize(cp.trim());
        if (!Security.validEmail(em)) { app.showToast('Please enter a valid email', 'error'); return; }
        if (app.clients.some(function(c) { return c.email === em; })) { app.showToast('Client with this email exists', 'error'); return; }
        var client = { id: Security.secureId('client'), name: nm, email: em, company: co, phone: ph, createdAt: new Date().toISOString() };
        app.setState({ user: app.user, clients: app.clients.concat([client]), invoices: app.invoices, settings: app.settings });
        setCn(''); setCe(''); setCc(''); setCp(''); setClientModal(false);
        app.showToast('Client added!', 'success');
    };

    /* ---- Invoice Creation State ---- */
    var defaultDue = function() { var d = new Date(); d.setDate(d.getDate() + (app.settings.paymentTerms || 30)); return d.toISOString().split('T')[0]; };
    var _ic = React.useState(''); var invClient = _ic[0], setInvClient = _ic[1];
    var _dd = React.useState(defaultDue); var dueDate = _dd[0], setDueDate = _dd[1];
    var _it = React.useState([{ desc: '', qty: 1, price: 0 }]); var items = _it[0], setItems = _it[1];
    var _nt = React.useState(''); var notes = _nt[0], setNotes = _nt[1];
    var invNum = 'INV-' + new Date().getFullYear() + '-' + String(app.invoices.length + 1).padStart(4, '0');
    var total = items.reduce(function(s, it) { return s + (it.qty * it.price); }, 0);
    var addItem = function() { setItems(items.concat([{ desc: '', qty: 1, price: 0 }])); };
    var updateItem = function(i, field, val) { var n = items.slice(); n[i] = Object.assign({}, n[i]); n[i][field] = field === 'desc' ? val : Number(val); setItems(n); };
    var removeItem = function(i) { if (items.length > 1) setItems(items.filter(function(_, idx) { return idx !== i; })); };
    var selClient = app.clients.find(function(c) { return c.id === invClient; });

    var createInvoice = function(e) {
        e.preventDefault();
        if (!invClient) { app.showToast('Please select a client', 'error'); return; }
        var cl = app.clients.find(function(c) { return c.id === invClient; });
        if (!cl) return;
        var validItems = items.filter(function(it) { return it.desc && it.qty > 0 && it.price > 0; }).map(function(it) { return { desc: it.desc, qty: it.qty, price: it.price, subtotal: it.qty * it.price }; });
        if (!validItems.length) { app.showToast('Add at least one valid item', 'error'); return; }
        var inv = { id: Security.secureId('inv'), number: invNum, clientId: invClient, clientName: cl.name, clientEmail: cl.email, items: validItems, total: validItems.reduce(function(s, i) { return s + i.subtotal; }, 0), notes: Security.sanitize(notes), dueDate: dueDate, status: 'pending', createdAt: new Date().toISOString() };
        app.setState({ user: app.user, clients: app.clients, invoices: app.invoices.concat([inv]), settings: app.settings });
        setItems([{ desc: '', qty: 1, price: 0 }]); setNotes(''); setInvClient('');
        app.setDashTab('invoices'); app.showToast('Invoice created!', 'success');
    };

    /* ---- Invoice Actions ---- */
    var markPaid = function(id) {
        app.setState({ user: app.user, clients: app.clients, invoices: app.invoices.map(function(i) { return i.id === id ? Object.assign({}, i, { status: 'paid', paidAt: new Date().toISOString() }) : i; }), settings: app.settings });
        app.showToast('Marked as paid!', 'success');
    };
    var deleteInv = function(id) {
        if (!confirm('Delete this invoice?')) return;
        app.setState({ user: app.user, clients: app.clients, invoices: app.invoices.filter(function(i) { return i.id !== id; }), settings: app.settings });
        app.showToast('Invoice deleted', 'success');
    };
    var downloadPdf = async function(id) {
        var inv = app.invoices.find(function(i) { return i.id === id; });
        if (!inv) return;
        try { await PDF.render(inv, app.user, app.settings); app.showToast('PDF downloaded!', 'success'); }
        catch (err) { app.showToast('PDF failed: ' + err.message, 'error'); }
    };

    /* ---- Settings State ---- */
    var _sb = React.useState(app.settings.business || ''); var sBiz = _sb[0], setSBiz = _sb[1];
    var _sa = React.useState(app.settings.address || ''); var sAddr = _sa[0], setSAddr = _sa[1];
    var _st = React.useState(app.settings.paymentTerms || 30); var sTerms = _st[0], setSTerms = _st[1];
    var saveSettings = function(e) {
        e.preventDefault();
        app.setState({ user: app.user, clients: app.clients, invoices: app.invoices, settings: Object.assign({}, app.settings, { business: Security.sanitize(sBiz), address: Security.sanitize(sAddr), paymentTerms: Number(sTerms) }) });
        app.showToast('Settings saved!', 'success');
    };

    /* ---- Session Timer ---- */
    var _tm = React.useState('30:00'); var timer = _tm[0], setTimer = _tm[1];
    React.useEffect(function() {
        var iv = setInterval(function() {
            var r = Math.max(0, app.session.expiry - Date.now());
            setTimer(Math.floor(r / 60000) + ':' + String(Math.floor((r % 60000) / 1000)).padStart(2, '0'));
        }, 1000);
        return function() { clearInterval(iv); };
    }, [app.session.expiry]);

    /* ---- Stats Cards Data ---- */
    var statsCards = [
        [fmt.currency(totalRev), 'Total Revenue', 'dollar-sign', 'green', '12.5%'],
        [fmt.currency(pendingAmt), 'Pending Payments', 'clock', 'yellow', pending.length + ' pending'],
        [app.invoices.length, 'Total Invoices', 'file-invoice', 'blue', ''],
        [app.clients.length, 'Active Clients', 'users', 'purple', '']
    ];

    var tableHeaders = ['Invoice', 'Client', 'Amount', 'Status', 'Date'];
    var tableHeadersFull = ['Invoice', 'Client', 'Amount', 'Status', 'Due Date', 'Actions'];

    return <section className="pt-16 min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex">

            {/* ===== Sidebar ===== */}
            <aside className="w-64 bg-white dark:bg-gray-800 min-h-screen shadow-lg fixed left-0 top-16 hidden lg:block">
                <nav className="p-4">
                    <ul className="space-y-2">
                        {[['home', 'overview', 'Dashboard'], ['file-invoice', 'invoices', 'Invoices'], ['users', 'clients', 'Clients'], ['plus-circle', 'create', 'Create Invoice'], ['cog', 'settings', 'Settings']].map(function(item) {
                            return <li key={item[1]}><button onClick={function() { app.setDashTab(item[1]); }} className={"w-full flex items-center px-4 py-3 rounded-lg transition-all " + (app.dashTab === item[1] ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300')}>
                                <i className={"fas fa-" + item[0] + " mr-3"}></i>{item[2]}
                            </button></li>;
                        })}
                    </ul>
                    <div className="mt-8 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                        <div className="flex items-center mb-2"><i className="fas fa-crown text-yellow-300 mr-2"></i><h4 className="font-semibold">Upgrade to Pro</h4></div>
                        <p className="text-sm text-white/80 mb-3">Get unlimited invoices</p>
                        <button className="w-full bg-white text-indigo-600 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition">Upgrade Now</button>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center mb-1"><i className="fas fa-shield-alt text-green-500 mr-2"></i><span>Session Secure</span></div>
                        <p>Expires in: {timer}</p>
                    </div>
                </nav>
            </aside>

            {/* ===== Main Content ===== */}
            <main className="flex-1 lg:ml-64 p-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-slide-up">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, <span className="gradient-text">{firstName}</span>!</h1>
                        <p className="text-gray-500">Here's what's happening with your invoices</p>
                    </div>
                    <button onClick={function() { app.setDashTab('create'); }} className="mt-4 md:mt-0 gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center hover:scale-105">
                        <i className="fas fa-plus mr-2"></i>New Invoice
                    </button>
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {app.dashTab === 'overview' && <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map(function(card, i) {
                            return <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover-lift animate-slide-up" style={{ animationDelay: i * 0.1 + 's' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={"w-12 h-12 bg-" + card[3] + "-100 dark:bg-" + card[3] + "-900 rounded-xl flex items-center justify-center"}>
                                        <i className={"fas fa-" + card[2] + " text-" + card[3] + "-600 dark:text-" + card[3] + "-400 text-xl"}></i>
                                    </div>
                                    {card[4] && <span className={"text-" + card[3] + "-500 text-sm font-medium"}>
                                        {card[4].indexOf('%') >= 0 ? <><i className="fas fa-arrow-up mr-1"></i>{card[4]}</> : card[4]}
                                    </span>}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{card[0]}</h3>
                                <p className="text-gray-500 text-sm">{card[1]}</p>
                            </div>;
                        })}
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-slide-up">
                        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold dark:text-white">Recent Invoices</h2>
                            <button onClick={function() { app.setDashTab('invoices'); }} className="text-indigo-600 text-sm hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700"><tr>{tableHeaders.map(function(h) { return <th key={h} className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{h}</th>; })}</tr></thead>
                                <tbody>
                                    {app.invoices.length === 0
                                        ? <tr><td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400"><i className="fas fa-file-invoice text-4xl text-gray-300 dark:text-gray-600 mb-3 block"></i><p>No invoices yet. Create your first!</p></td></tr>
                                        : app.invoices.slice(-5).reverse().map(function(inv) {
                                            return <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="py-4 px-6 font-medium dark:text-white">{inv.number}</td>
                                                <td className="py-4 px-6 dark:text-gray-300">{inv.clientName}</td>
                                                <td className="py-4 px-6 font-semibold dark:text-white">{fmt.currency(inv.total)}</td>
                                                <td className="py-4 px-6"><span className={"px-3 py-1 rounded-full text-sm font-medium " + statusCls[inv.status]}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
                                                <td className="py-4 px-6 text-gray-500">{fmt.date(inv.dueDate)}</td>
                                            </tr>;
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>}

                {/* ===== INVOICES TAB ===== */}
                {app.dashTab === 'invoices' && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="p-6 border-b dark:border-gray-700"><h2 className="text-lg font-semibold dark:text-white">All Invoices</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700"><tr>{tableHeadersFull.map(function(h) { return <th key={h} className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{h}</th>; })}</tr></thead>
                            <tbody>
                                {app.invoices.length === 0
                                    ? <tr><td colSpan={6} className="py-12 text-center text-gray-500"><i className="fas fa-file-invoice text-4xl text-gray-300 mb-3 block"></i><p>No invoices yet</p></td></tr>
                                    : app.invoices.slice().reverse().map(function(inv) {
                                        return <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="py-4 px-6 font-medium dark:text-white">{inv.number}</td>
                                            <td className="py-4 px-6 dark:text-gray-300">{inv.clientName}</td>
                                            <td className="py-4 px-6 font-semibold dark:text-white">{fmt.currency(inv.total)}</td>
                                            <td className="py-4 px-6"><span className={"px-3 py-1 rounded-full text-sm font-medium " + statusCls[inv.status]}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
                                            <td className="py-4 px-6 text-gray-500">{fmt.date(inv.dueDate)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={function() { downloadPdf(inv.id); }} className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 hover:bg-purple-200 transition flex items-center justify-center tooltip" data-tip="Download PDF"><i className="fas fa-file-pdf"></i></button>
                                                    <button onClick={function() { markPaid(inv.id); }} className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 transition flex items-center justify-center tooltip" data-tip="Mark Paid"><i className="fas fa-check"></i></button>
                                                    <button onClick={function() { app.showToast('Reminder sent to ' + inv.clientEmail + '!', 'success'); }} className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition flex items-center justify-center tooltip" data-tip="Send Reminder"><i className="fas fa-bell"></i></button>
                                                    <button onClick={function() { deleteInv(inv.id); }} className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 transition flex items-center justify-center tooltip" data-tip="Delete"><i className="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>;
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>}

                {/* ===== CLIENTS TAB ===== */}
                {app.dashTab === 'clients' && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="p-6 border-b dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between">
                        <h2 className="text-lg font-semibold dark:text-white">Your Clients</h2>
                        <button onClick={function() { setClientModal(true); }} className="mt-4 md:mt-0 gradient-bg text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition hover:scale-105"><i className="fas fa-plus mr-2"></i>Add Client</button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {app.clients.length === 0
                            ? <div className="text-center text-gray-500 col-span-full py-12"><i className="fas fa-users text-4xl text-gray-300 mb-3 block"></i><p>No clients yet. Add your first client!</p></div>
                            : app.clients.map(function(cl) {
                                var ci = app.invoices.filter(function(i) { return i.clientId === cl.id; });
                                return <div key={cl.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition hover-lift">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-lg">{cl.name.charAt(0).toUpperCase()}</div>
                                        <div className="ml-4"><h3 className="font-semibold dark:text-white">{cl.name}</h3><p className="text-sm text-gray-500">{cl.company || 'Individual'}</p></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2 flex items-center"><i className="fas fa-envelope mr-2 text-indigo-500"></i>{cl.email}</p>
                                    {cl.phone && <p className="text-sm text-gray-500 mb-4 flex items-center"><i className="fas fa-phone mr-2 text-indigo-500"></i>{cl.phone}</p>}
                                    <div className="border-t dark:border-gray-600 pt-4 flex justify-between text-sm">
                                        <span className="text-gray-500">{ci.length} invoices</span>
                                        <span className="font-semibold gradient-text">{fmt.currency(ci.reduce(function(s, i) { return s + i.total; }, 0))}</span>
                                    </div>
                                </div>;
                            })}
                    </div>
                </div>}

                {/* ===== CREATE TAB ===== */}
                {app.dashTab === 'create' && <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-slide-up">
                        <h2 className="text-lg font-semibold mb-6 dark:text-white flex items-center"><i className="fas fa-file-invoice text-indigo-600 mr-2"></i>Create New Invoice</h2>
                        <form onSubmit={createInvoice}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="block text-sm font-medium mb-2 dark:text-gray-300">Invoice Number</label><input type="text" value={invNum} readOnly className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" /></div>
                                <div><label className="block text-sm font-medium mb-2 dark:text-gray-300">Due Date</label><input type="date" value={dueDate} onChange={function(e) { setDueDate(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" required /></div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Client</label>
                                <select value={invClient} onChange={function(e) { setInvClient(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" required>
                                    <option value="">Select a client</option>
                                    {app.clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Items</label>
                                <div className="space-y-3">
                                    {items.map(function(it, i) {
                                        return <div key={i} className="flex items-center space-x-2">
                                            <input type="text" placeholder="Description" value={it.desc} onChange={function(e) { updateItem(i, 'desc', e.target.value); }} className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg" />
                                            <input type="number" placeholder="Qty" value={it.qty} onChange={function(e) { updateItem(i, 'qty', e.target.value); }} className="w-20 px-4 py-2 border dark:border-gray-600 rounded-lg" min={1} />
                                            <input type="number" placeholder="Price" value={it.price || ''} onChange={function(e) { updateItem(i, 'price', e.target.value); }} className="w-28 px-4 py-2 border dark:border-gray-600 rounded-lg" step="0.01" min={0} />
                                            {items.length > 1 && <button type="button" onClick={function() { removeItem(i); }} className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 transition flex items-center justify-center"><i className="fas fa-times"></i></button>}
                                        </div>;
                                    })}
                                </div>
                                <button type="button" onClick={addItem} className="mt-3 text-indigo-600 font-medium hover:text-indigo-800 transition flex items-center"><i className="fas fa-plus-circle mr-2"></i>Add Item</button>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Notes</label>
                                <textarea value={notes} onChange={function(e) { setNotes(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" rows={3} placeholder="Payment terms, thank you message..."></textarea>
                            </div>
                            <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
                                <div className="text-xl font-bold dark:text-white">Total: <span className="gradient-text">{fmt.currency(total)}</span></div>
                                <button type="submit" className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center hover:scale-105"><i className="fas fa-paper-plane mr-2"></i>Create Invoice</button>
                            </div>
                        </form>
                    </div>

                    {/* Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-lg font-semibold mb-6 dark:text-white flex items-center"><i className="fas fa-eye text-indigo-600 mr-2"></i>Preview</h2>
                        <div className="border dark:border-gray-700 rounded-xl p-6 invoice-preview">
                            <div className="flex justify-between items-start mb-8">
                                <div><h3 className="text-2xl font-bold gradient-text">INVOICE</h3><p className="text-gray-500">#{invNum}</p></div>
                                <div className="text-right"><p className="font-semibold dark:text-white">{app.settings.business || u.name}</p><p className="text-gray-500 text-sm">{u.email}</p></div>
                            </div>
                            <div className="mb-6"><p className="text-sm text-gray-500 mb-1">Bill To:</p><p className="font-semibold dark:text-white">{selClient ? selClient.name : 'Select a client'}</p>{selClient && <p className="text-gray-500 text-sm">{selClient.email}</p>}</div>
                            <div className="border-t border-b dark:border-gray-600 py-4 my-4">
                                {items.filter(function(it) { return it.desc; }).length === 0
                                    ? <p className="text-gray-400 text-center">Add items to see preview</p>
                                    : items.filter(function(it) { return it.desc; }).map(function(it, i) {
                                        return <div key={i} className="flex justify-between text-sm mb-2"><span className="text-gray-600 dark:text-gray-400">{it.desc} (x{it.qty})</span><span className="font-medium dark:text-white">{fmt.currency(it.qty * it.price)}</span></div>;
                                    })}
                            </div>
                            <div className="flex justify-end"><div className="text-right"><p className="text-gray-500 mb-2">Total Amount</p><p className="text-3xl font-bold gradient-text">{fmt.currency(total)}</p></div></div>
                        </div>
                    </div>
                </div>}

                {/* ===== SETTINGS TAB ===== */}
                {app.dashTab === 'settings' && <div className="max-w-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 animate-slide-up">
                        <h2 className="text-lg font-semibold mb-6 dark:text-white flex items-center"><i className="fas fa-user-cog text-indigo-600 mr-2"></i>Profile Settings</h2>
                        <form onSubmit={saveSettings}>
                            <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Business Name</label><input type="text" value={sBiz} onChange={function(e) { setSBiz(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" placeholder="Your Business Name" /></div>
                            <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label><input type="email" value={u.email} readOnly className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" /></div>
                            <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Address</label><textarea value={sAddr} onChange={function(e) { setSAddr(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" rows={2} placeholder="Your business address"></textarea></div>
                            <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Default Payment Terms</label><select value={sTerms} onChange={function(e) { setSTerms(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg"><option value={7}>Net 7 days</option><option value={14}>Net 14 days</option><option value={30}>Net 30 days</option><option value={60}>Net 60 days</option></select></div>
                            <button type="submit" className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition hover:scale-105"><i className="fas fa-save mr-2"></i>Save Settings</button>
                        </form>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 animate-slide-up">
                        <h2 className="text-lg font-semibold mb-6 dark:text-white flex items-center"><i className="fas fa-shield-alt text-green-600 mr-2"></i>Security</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center"><i className="fas fa-key text-indigo-600 mr-3"></i><div><p className="font-medium dark:text-white">Two-Factor Authentication</p><p className="text-sm text-gray-500">Add extra security</p></div></div>
                                <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium">Enable</button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center"><i className="fas fa-history text-indigo-600 mr-3"></i><div><p className="font-medium dark:text-white">Login History</p><p className="text-sm text-gray-500">View recent login activity</p></div></div>
                                <button className="px-4 py-2 text-indigo-600 hover:underline text-sm font-medium">View</button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-slide-up">
                        <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center"><i className="fas fa-crown text-yellow-500 mr-2"></i>Subscription</h2>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div><p className="font-semibold dark:text-white">Current Plan: <span className="text-indigo-600">Free</span></p><p className="text-sm text-gray-500">5 invoices/month</p></div>
                            <button className="gradient-bg text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">Upgrade</button>
                        </div>
                    </div>
                    <button onClick={function() { app.destroySession(); app.setState({ user: null, clients: [], invoices: [], settings: {} }); app.setSection('landing'); app.showToast('Logged out successfully', 'success'); }} className="mt-6 w-full py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center justify-center"><i className="fas fa-sign-out-alt mr-2"></i>Logout</button>
                </div>}

            </main>
        </div>

        {/* ===== Add Client Modal ===== */}
        <Modal open={clientModal} onClose={function() { setClientModal(false); }}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold dark:text-white flex items-center"><i className="fas fa-user-plus text-indigo-600 mr-2"></i>Add New Client</h2>
                <button onClick={function() { setClientModal(false); }} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={addClient}>
                <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Client Name *</label><input type="text" value={cn} onChange={function(e) { setCn(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" required /></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Email *</label><input type="email" value={ce} onChange={function(e) { setCe(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" required /></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Company</label><input type="text" value={cc} onChange={function(e) { setCc(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" /></div>
                <div className="mb-6"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone</label><input type="tel" value={cp} onChange={function(e) { setCp(e.target.value); }} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg" /></div>
                <button type="submit" className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">Add Client</button>
            </form>
        </Modal>
    </section>;
};
