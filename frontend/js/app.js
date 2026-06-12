/* ================================================================== */
/*  app.js — Main App Component with auth boot sequence                */
/* ================================================================== */

var React_Fragment = React.Fragment;
var React_createElement = React.createElement;

window.App = function() {
  var app = useApp();
  var theme = useTheme();

  // Show loading screen while authenticating
  if (app.isLoading || !app.authChecked) {
    return React_createElement('div', { className: 'min-h-screen flex items-center justify-center gradient-bg' },
      React_createElement('div', { className: 'text-center' },
        React_createElement('div', { className: 'w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4' },
          React_createElement('i', { className: 'fas fa-spinner text-2xl text-white animate-spin' })
        ),
        React_createElement('p', { className: 'text-gray-600 dark:text-gray-400' }, 'Loading InvoiceFlow...')
      )
    );
  }

  // Render appropriate page based on auth status and current section
  var renderPage = function() {
    // If not authenticated, only show landing, login, or signup
    if (!app.isAuthenticated) {
      if (app.section === 'login') {
        return React_createElement(LoginPage);
      } else if (app.section === 'signup') {
        return React_createElement(SignupPage);
      }
      // Default to landing for unauthenticated users
      return React_createElement(LandingPage);
    }

    // If authenticated, show dashboard or other pages
    if (app.section === 'dashboard') {
      return React_createElement(DashboardPage);
    }
    
    // Fallback to landing
    return React_createElement(LandingPage);
  };

  return React_createElement(React_Fragment, null,
    // Toast notification
    app.toast && React_createElement('div', {
      className: 'fixed bottom-4 right-4 z-50 animate-slide-up'
    },
      React_createElement('div', {
        className: 'px-6 py-3 rounded-lg shadow-lg font-medium ' +
          (app.toast.type === 'error' ? 'bg-red-500 text-white' : '') +
          (app.toast.type === 'warning' ? 'bg-yellow-500 text-white' : '') +
          (app.toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white')
      },
        React_createElement('div', { className: 'flex items-center gap-2' },
          React_createElement('i', {
            className: 'fas ' +
              (app.toast.type === 'error' ? 'fa-exclamation-circle' : '') +
              (app.toast.type === 'warning' ? 'fa-triangle-exclamation' : '') +
              (app.toast.type === 'success' ? 'fa-check-circle' : 'fa-info-circle')
          }),
          React_createElement('span', null, app.toast.message)
        )
      )
    ),

    // Main page content
    renderPage()
  );
};

// Root render
ReactDOM.render(
  React_createElement(ThemeProvider, null,
    React_createElement(AppProvider, null,
      React_createElement(App)
    )
  ),
  document.getElementById('root')
);
