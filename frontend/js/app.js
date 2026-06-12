/* ================================================================== */
/*  app.js — Root App Component + React Mount                         */
/* ================================================================== */

window.App = function() {
    var app = useApp();

    /* Block all UI until auth check completes */
    if (app.isLoading || !app.authCheckDone) {
        return React.createElement('div', { className: 'fixed inset-0 z-[10001] flex items-center justify-center bg-white dark:bg-gray-900' },
            React.createElement('div', { className: 'flex flex-col items-center gap-4' },
                React.createElement('span', { className: 'spinner', style: { borderColor: 'rgba(0,0,0,0.12)', borderTopColor: 'var(--primary)', width: '40px', height: '40px' } }),
                React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 font-medium' }, 'Loading...')
            )
        );
    }

    /* Conditional rendering: Authenticated vs Unauthenticated */
    if (!app.isAuthenticated) {
        /* Unauthenticated view — show landing, login, or signup only */
        return React.createElement(
            React.Fragment,
            null,
            React.createElement(Navbar),
            React.createElement(DarkModeToggle),
            app.section === 'landing' && React.createElement(LandingPage),
            app.section === 'login' && React.createElement(LoginPage),
            app.section === 'signup' && React.createElement(SignupPage),
            React.createElement(Toast),
            React.createElement('div', { id: 'pdfBusy', className: 'fixed inset-0 z-[10000] hidden items-center justify-center bg-black/40 backdrop-blur-sm' },
                React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 flex items-center gap-4' },
                    React.createElement('span', { className: 'spinner', style: { borderColor: 'rgba(0,0,0,0.12)', borderTopColor: 'var(--primary)' } }),
                    React.createElement('div', null,
                        React.createElement('p', { className: 'font-semibold text-gray-900 dark:text-white' }, 'Generating PDF...'),
                        React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400' }, 'Please keep this tab open.')
                    )
                )
            )
        );
    }

    /* Authenticated view — show navbar + dashboard only */
    return React.createElement(
        React.Fragment,
        null,
        React.createElement(Navbar),
        React.createElement(DarkModeToggle),
        app.section === 'dashboard' && React.createElement(DashboardPage),
        React.createElement(Toast),
        React.createElement('div', { id: 'pdfBusy', className: 'fixed inset-0 z-[10000] hidden items-center justify-center bg-black/40 backdrop-blur-sm' },
            React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 flex items-center gap-4' },
                React.createElement('span', { className: 'spinner', style: { borderColor: 'rgba(0,0,0,0.12)', borderTopColor: 'var(--primary)' } }),
                React.createElement('div', null,
                    React.createElement('p', { className: 'font-semibold text-gray-900 dark:text-white' }, 'Generating PDF...'),
                    React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400' }, 'Please keep this tab open.')
                )
            )
        )
    );
};

/* ---- Mount React App ---- */
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    React.createElement(ThemeProvider, null,
        React.createElement(AppProvider, null,
            React.createElement(App)
        )
    )
);
