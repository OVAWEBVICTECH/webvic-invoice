/* ================================================================== */
/*  components.js — Reusable UI Components                            */
/*  Toast, DarkModeToggle, Modal, PasswordStrength, Navbar            */
/* ================================================================== */

/* ---------- Toast ---------- */
window.Toast = function() {
    var app = useApp();
    if (!app.toast) return null;
    var styles = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' };
    var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    var t = app.toast;
    return React.createElement('div', { className: 'fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center max-w-sm text-white animate-slide-up ' + (styles[t.type] || styles.success) },
        React.createElement('i', { className: 'fas ' + (icons[t.type] || icons.success) + ' text-xl mr-3' }),
        React.createElement('span', { className: 'flex-1' }, t.message)
    );
};

/* ---------- Dark Mode Toggle ---------- */
window.DarkModeToggle = function() {
    var theme = useTheme();
    return React.createElement('button', { onClick: theme.toggle, className: 'fixed bottom-6 left-6 z-50 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition group' },
        theme.dark
            ? React.createElement('i', { className: 'fas fa-sun text-yellow-400' })
            : React.createElement('i', { className: 'fas fa-moon text-gray-600 group-hover:text-indigo-600' })
    );
};

/* ---------- Modal ---------- */
window.Modal = function(props) {
    if (!props.open) return null;
    var mw = props.maxW || 'max-w-md';
    return React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm', onClick: function(e) { if (e.target === e.currentTarget) props.onClose(); } },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full ' + mw + ' mx-4 animate-scale-in' },
            props.children
        )
    );
};

/* ---------- Password Strength ---------- */
window.PasswordStrength = function(props) {
    var password = props.password;
    var s = Security.strength(password);
    var cls = !password ? '' : 'strength-' + (s <= 2 ? 'weak' : s <= 3 ? 'medium' : 'strong');
    var txt = !password ? 'Use 8+ characters, uppercase, numbers & symbols'
        : s <= 2 ? 'Weak password' : s <= 3 ? 'Medium strength' : 'Strong password';
    var clr = !password ? 'text-gray-500' : s <= 2 ? 'text-red-500' : s <= 3 ? 'text-yellow-500' : 'text-green-500';

    return React.createElement('div', { className: 'mt-2' },
        React.createElement('div', { className: 'bg-gray-200 dark:bg-gray-600 rounded-full h-1 overflow-hidden' },
            React.createElement('div', { className: 'strength-bar h-full transition-all ' + cls, style: { width: !password ? 0 : undefined } })
        ),
        React.createElement('p', { className: 'text-xs mt-1 ' + clr }, txt)
    );
};

/* ---------- Navbar ---------- */
window.Navbar = function() {
    var app = useApp();
    var _m = React.useState(false);
    var mobileOpen = _m[0], setMobile = _m[1];
    var isAuth = app.isAuthenticated;

    var goHome = function() {
        if (isAuth) {
            app.setSection('dashboard', 'overview');
        } else {
            app.setSection('landing');
        }
        setMobile(false);
    };

    var navGo = function(tab) {
        app.setSection('dashboard', tab);
        setMobile(false);
    };

    var landingLinks = ['Features', 'Templates', 'Pricing', 'Blog', 'About', 'Contact'];
    var dashLinks = [['overview', 'Dashboard'], ['invoices', 'Invoices'], ['clients', 'Clients'], ['create', 'Create'], ['settings', 'Settings']];
    var mobileLandingLinks = [['star', 'Features'], ['palette', 'Templates'], ['tag', 'Pricing'], ['blog', 'Blog'], ['info-circle', 'About'], ['envelope', 'Contact']];
    var mobileDashLinks = [['home', 'overview', 'Dashboard'], ['file-invoice', 'invoices', 'Invoices'], ['users', 'clients', 'Clients'], ['plus-circle', 'create', 'Create'], ['cog', 'settings', 'Settings']];

    var handleLogout = function() {
        app.logout();
        setMobile(false);
    };

    return React.createElement(
        React.Fragment,
        null,
        React.createElement('nav', { className: 'fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm' },
            React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
                React.createElement('div', { className: 'flex justify-between items-center h-16' },
                    React.createElement('div', { className: 'flex items-center cursor-pointer', onClick: goHome },
                        React.createElement('div', { className: 'w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mr-2 hover-lift' },
                            React.createElement('i', { className: 'fas fa-file-invoice-dollar text-lg text-white' })
                        ),
                        React.createElement('span', { className: 'text-xl font-bold gradient-text' }, 'InvoiceFlow')
                    ),
                    React.createElement('div', { className: 'hidden md:flex items-center' },
                        !isAuth ? React.createElement('div', { className: 'flex items-center space-x-6' },
                            landingLinks.map(function(n) {
                                return React.createElement('a', { key: n, href: '#' + n.toLowerCase(), className: 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition relative group text-sm font-medium' },
                                    n,
                                    React.createElement('span', { className: 'absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full' })
                                );
                            }),
                            React.createElement('button', { onClick: function() { app.setSection('login'); }, className: 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition text-sm font-medium' }, 'Login'),
                            React.createElement('button', { onClick: function() { app.setSection('signup'); }, className: 'gradient-bg text-white px-5 py-2 rounded-full hover:opacity-90 transition shadow-lg hover:shadow-xl' },
                                React.createElement('i', { className: 'fas fa-rocket mr-2' }),
                                'Start Free Trial'
                            )
                        ) : React.createElement('div', { className: 'flex items-center space-x-5' },
                            dashLinks.map(function(item) {
                                return React.createElement('button', { key: item[0], onClick: function() { navGo(item[0]); }, className: 'font-medium transition ' + (app.dashTab === item[0] ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600') },
                                    item[1]
                                );
                            }),
                            React.createElement('button', { onClick: handleLogout, className: 'px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15 transition font-semibold' },
                                React.createElement('i', { className: 'fas fa-sign-out-alt mr-2' }),
                                'Logout'
                            )
                        )
                    ),
                    React.createElement('button', { className: 'md:hidden text-gray-600 dark:text-gray-300', onClick: function() { setMobile(!mobileOpen); } },
                        React.createElement('i', { className: 'fas ' + (mobileOpen ? 'fa-times' : 'fa-bars') + ' text-xl' })
                    )
                )
            )
        ),
        mobileOpen && React.createElement('div', { className: 'fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-20 px-6 animate-fade-in overflow-y-auto' },
            React.createElement('button', { onClick: function() { setMobile(false); }, className: 'absolute top-5 right-5 text-gray-600 dark:text-gray-300' },
                React.createElement('i', { className: 'fas fa-times text-2xl' })
            ),
            !isAuth ? React.createElement('div', { className: 'flex flex-col space-y-2' },
                mobileLandingLinks.map(function(item) {
                    return React.createElement('a', { key: item[1], href: '#' + item[1].toLowerCase(), className: 'text-lg py-3 border-b dark:border-gray-700 flex items-center', onClick: function() { setMobile(false); } },
                        React.createElement('i', { className: 'fas fa-' + item[0] + ' mr-3 text-indigo-600' }),
                        item[1]
                    );
                }),
                React.createElement('button', { onClick: function() { app.setSection('login'); setMobile(false); }, className: 'text-lg py-3 border-b dark:border-gray-700 text-left flex items-center' },
                    React.createElement('i', { className: 'fas fa-sign-in-alt mr-3 text-indigo-600' }),
                    'Login'
                ),
                React.createElement('button', { onClick: function() { app.setSection('signup'); setMobile(false); }, className: 'gradient-bg text-white py-4 rounded-full mt-4 font-semibold' },
                    React.createElement('i', { className: 'fas fa-rocket mr-2' }),
                    'Start Free Trial'
                )
            ) : React.createElement('div', { className: 'flex flex-col space-y-2' },
                mobileDashLinks.map(function(item) {
                    return React.createElement('button', { key: item[1], onClick: function() { navGo(item[1]); }, className: 'text-lg py-3 border-b dark:border-gray-700 text-left flex items-center' },
                        React.createElement('i', { className: 'fas fa-' + item[0] + ' mr-3 text-indigo-600' }),
                        item[2]
                    );
                }),
                React.createElement('button', { onClick: handleLogout, className: 'mt-4 w-full py-3 rounded-full bg-red-500 text-white font-semibold' },
                    React.createElement('i', { className: 'fas fa-sign-out-alt mr-2' }),
                    'Logout'
                )
            )
        )
    );
};
