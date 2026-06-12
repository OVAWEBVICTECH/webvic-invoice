/* ================================================================== */
/*  pages/Auth.js — Login & Signup Pages                              */
/* ================================================================== */

/* ---------- Login Page ---------- */
window.LoginPage = function() {
    var app = useApp();
    var _e = React.useState(''); var email = _e[0], setEmail = _e[1];
    var _p = React.useState(''); var password = _p[0], setPassword = _p[1];
    var _s = React.useState(false); var showPw = _s[0], setShowPw = _s[1];
    var _l = React.useState(false); var loading = _l[0], setLoading = _l[1];
    var _w = React.useState(''); var warning = _w[0], setWarning = _w[1];

    var handleSubmit = async function(e) {
        e.preventDefault();
        var em = Security.sanitize(email.trim().toLowerCase());
        if (!Security.validEmail(em)) { app.showToast('Please enter a valid email', 'error'); return; }
        if (!Security.rateLimiter.check(em)) { setWarning('Too many attempts. Try again in ' + Math.ceil(Security.rateLimiter.remaining(em) / 60) + ' min.'); return; }
        setLoading(true);
        try {
            var res = await Backend.auth.login({ email: em, password: password });
            var u = res.user;
            app.setAuthState(u, res.token);
            await app.loadWorkspace(Object.assign({}, u, { business: u.businessName || u.name }));
            Security.rateLimiter.reset(em);
            setWarning('');
            app.setSection('dashboard', 'overview');
            app.showToast('Welcome back!', 'success');
        } catch (err) { Security.rateLimiter.inc(em); setWarning(err.message || 'Login failed'); app.showToast(err.message || 'Login failed', 'error'); }
        finally { setLoading(false); }
    };

    return <section className="min-h-screen flex items-center justify-center gradient-bg py-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
            <div className="text-center mb-8">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4"><i className="fas fa-file-invoice-dollar text-2xl text-white"></i></div>
                <h2 className="text-2xl font-bold dark:text-white">Welcome Back</h2>
                <p className="text-gray-500">Sign in to your account</p>
            </div>
            {warning && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i>{warning}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
                    <div className="relative">
                        <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} className="w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="you@example.com" required />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Password</label>
                    <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type={showPw ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value); }} className="w-full pl-12 pr-12 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition" placeholder="********" required />
                        <button type="button" onClick={function() { setShowPw(!showPw); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><i className={"fas fa-eye" + (showPw ? '-slash' : '')}></i></button>
                    </div>
                </div>
                <button type="submit" disabled={loading} className={"w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center " + (loading ? 'btn-loading' : '')}>
                    {loading ? <><span className="spinner mr-2"></span>Signing in...</> : 'Sign In'}
                </button>
            </form>
            <div className="mt-6 text-center"><p className="text-gray-500">Don't have an account? <button onClick={function() { app.setSection('signup'); }} className="text-indigo-600 font-semibold hover:underline">Sign up</button></p></div>
            <button onClick={function() { app.setSection('landing'); }} className="mt-4 w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center justify-center"><i className="fas fa-arrow-left mr-2"></i>Back to home</button>
        </div>
    </section>;
};

/* ---------- Signup Page ---------- */
window.SignupPage = function() {
    var app = useApp();
    var _n = React.useState(''); var name = _n[0], setName = _n[1];
    var _e = React.useState(''); var email = _e[0], setEmail = _e[1];
    var _p = React.useState(''); var password = _p[0], setPassword = _p[1];
    var _b = React.useState(''); var business = _b[0], setBusiness = _b[1];
    var _s = React.useState(false); var showPw = _s[0], setShowPw = _s[1];
    var _l = React.useState(false); var loading = _l[0], setLoading = _l[1];
    var _a = React.useState(false); var agreed = _a[0], setAgreed = _a[1];

    var handleSubmit = async function(e) {
        e.preventDefault();
        var nm = Security.sanitize(name.trim()), em = Security.sanitize(email.trim().toLowerCase()), biz = Security.sanitize(business.trim()) || nm;
        if (nm.length < 2) { app.showToast('Name must be at least 2 characters', 'error'); return; }
        if (!Security.validEmail(em)) { app.showToast('Please enter a valid email', 'error'); return; }
        if (Security.strength(password) < 3) { app.showToast('Please choose a stronger password', 'error'); return; }
        setLoading(true);
        try {
            var res = await Backend.auth.signup({ name: nm, email: em, password: password, businessName: biz });
            var u = res.user;
            app.setAuthState(u, res.token);
            await app.loadWorkspace(Object.assign({}, u, { business: u.businessName || u.name }));
            app.setSection('dashboard', 'overview'); app.showToast('Welcome to InvoiceFlow!', 'success');
        } catch (err) { app.showToast(err.message || 'Signup failed', 'error'); } finally { setLoading(false); }
    };

    return <section className="min-h-screen flex items-center justify-center gradient-bg py-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
            <div className="text-center mb-8">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4"><i className="fas fa-rocket text-2xl text-white"></i></div>
                <h2 className="text-2xl font-bold dark:text-white">Start Your Free Trial</h2>
                <p className="text-gray-500">14 days free, no credit card required</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Full Name</label>
                    <div className="relative"><i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i><input type="text" value={name} onChange={function(e) { setName(e.target.value); }} className="w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg" placeholder="John Doe" required minLength={2} /></div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
                    <div className="relative"><i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i><input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} className="w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg" placeholder="you@example.com" required /></div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Password</label>
                    <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type={showPw ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value); }} className="w-full pl-12 pr-12 py-3 border dark:border-gray-600 rounded-lg" placeholder="********" required minLength={8} />
                        <button type="button" onClick={function() { setShowPw(!showPw); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"><i className={"fas fa-eye" + (showPw ? '-slash' : '')}></i></button>
                    </div>
                    <PasswordStrength password={password} />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Business Name (Optional)</label>
                    <div className="relative"><i className="fas fa-building absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i><input type="text" value={business} onChange={function(e) { setBusiness(e.target.value); }} className="w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg" placeholder="Your Company" /></div>
                </div>
                <div className="mb-6">
                    <label className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <input type="checkbox" checked={agreed} onChange={function(e) { setAgreed(e.target.checked); }} className="mr-2 mt-1 rounded" required />
                        <span>I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a></span>
                    </label>
                </div>
                <button type="submit" disabled={loading || !agreed} className={"w-full gradient-bg text-white py-3 rounded-lg font-semibold transition flex items-center justify-center " + (loading ? 'btn-loading' : '')}>
                    {loading ? <><span className="spinner mr-2"></span>Creating account...</> : 'Create Account'}
                </button>
            </form>
            <div className="mt-6 text-center"><p className="text-gray-500">Already have an account? <button onClick={function() { app.setSection('login'); }} className="text-indigo-600 font-semibold hover:underline">Sign in</button></p></div>
            <button onClick={function() { app.setSection('landing'); }} className="mt-4 w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center justify-center"><i className="fas fa-arrow-left mr-2"></i>Back to home</button>
        </div>
    </section>;
};
