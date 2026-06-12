/* ================================================================== */
/*  app.js — Root App Component + React Mount                         */
/* ================================================================== */

window.App = function() {
    var app = useApp();

    if (app.initializing) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><span className="spinner mr-3"></span><span className="text-gray-600 dark:text-gray-300">Loading InvoiceFlow...</span></div>;
    }

    return <>
        <Navbar />
        <DarkModeToggle />
        {app.section === 'landing' && <LandingPage />}
        {app.section === 'login' && <LoginPage />}
        {app.section === 'signup' && <SignupPage />}
        {app.section === 'dashboard' && <DashboardPage />}
        <Toast />

        {/* PDF Generation Overlay */}
        <div id="pdfBusy" className="fixed inset-0 z-[10000] hidden items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 flex items-center gap-4">
                <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.12)', borderTopColor: 'var(--primary)' }}></span>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Generating PDF...</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Please keep this tab open.</p>
                </div>
            </div>
        </div>
    </>;
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
