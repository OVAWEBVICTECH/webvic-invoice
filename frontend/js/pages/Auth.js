/* ================================================================== */
/*  pages/Auth.js — Login & Signup Pages (Backend Integrated)         */
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
    
    if (!Security.validEmail(em)) {
      app.showToast('Please enter a valid email', 'error');
      return;
    }
    
    if (!Security.rateLimiter.check(em)) {
      setWarning('Too many attempts. Try again in ' + Math.ceil(Security.rateLimiter.remaining(em) / 60) + ' min.');
      return;
    }
    
    setLoading(true);
    try {
      var success = await app.login(em, password);
      if (success) {
        Security.rateLimiter.reset(em);
        setWarning('');
        app.showToast('Welcome back!', 'success');
      } else {
        Security.rateLimiter.inc(em);
        var rem = 5 - (Security.rateLimiter.attempts[em] ? Security.rateLimiter.attempts[em].count : 0);
        setWarning('Invalid credentials. ' + rem + ' attempts remaining.');
      }
    } catch (err) {
      Security.rateLimiter.inc(em);
      setWarning(err.message || 'Login failed');
      app.showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('section', { className: 'min-h-screen flex items-center justify-center gradient-bg py-20' },
    React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-scale-in' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('div', { className: 'w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4' },
          React.createElement('i', { className: 'fas fa-file-invoice-dollar text-2xl text-white' })
        ),
        React.createElement('h2', { className: 'text-2xl font-bold dark:text-white' }, 'Welcome Back'),
        React.createElement('p', { className: 'text-gray-500' }, 'Sign in to your account')
      ),
      warning && React.createElement('div', { className: 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm' },
        React.createElement('i', { className: 'fas fa-exclamation-circle mr-2' }),
        warning
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'Email'),
          React.createElement('div', { className: 'relative' },
            React.createElement('i', { className: 'fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' }),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: function(e) { setEmail(e.target.value); },
              className: 'w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white',
              placeholder: 'your@email.com',
              disabled: loading
            })
          )
        ),
        React.createElement('div', { className: 'mb-6' },
          React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'Password'),
          React.createElement('div', { className: 'relative' },
            React.createElement('i', { className: 'fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' }),
            React.createElement('input', {
              type: showPw ? 'text' : 'password',
              value: password,
              onChange: function(e) { setPassword(e.target.value); },
              className: 'w-full pl-12 pr-12 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white',
              placeholder: 'Enter your password',
              disabled: loading
            }),
            React.createElement('button', {
              type: 'button',
              onClick: function() { setShowPw(!showPw); },
              className: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600',
              tabIndex: -1
            },
              React.createElement('i', { className: 'fas ' + (showPw ? 'fa-eye-slash' : 'fa-eye') })
            )
          )
        ),
        React.createElement('button', {
          type: 'submit',
          disabled: loading,
          className: 'w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center ' + (loading ? 'opacity-50 cursor-not-allowed' : '')
        },
          loading ?
            React.createElement(React.Fragment, null,
              React.createElement('span', { className: 'spinner mr-2' }),
              'Signing in...'
            ) :
            'Sign In'
        )
      ),
      React.createElement('div', { className: 'mt-6 text-center' },
        React.createElement('p', { className: 'text-gray-500' },
          "Don't have an account? ",
          React.createElement('button', {
            onClick: function() { app.setSection('signup'); },
            className: 'text-indigo-600 font-semibold hover:underline'
          }, 'Sign Up')
        )
      ),
      React.createElement('button', {
        onClick: function() { app.setSection('landing'); },
        className: 'mt-4 w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center justify-center'
      },
        React.createElement('i', { className: 'fas fa-arrow-left mr-2' }),
        'Back to Home'
      )
    )
  );
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
    
    if (nm.length < 2) {
      app.showToast('Name must be at least 2 characters', 'error');
      return;
    }
    if (!Security.validEmail(em)) {
      app.showToast('Please enter a valid email', 'error');
      return;
    }
    if (Security.strength(password) < 3) {
      app.showToast('Please choose a stronger password', 'error');
      return;
    }
    
    setLoading(true);
    try {
      var success = await app.signup(nm, em, password, biz);
      if (success) {
        app.showToast('Welcome to InvoiceFlow!', 'success');
      }
    } catch (err) {
      app.showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('section', { className: 'min-h-screen flex items-center justify-center gradient-bg py-20' },
    React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-scale-in' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('div', { className: 'w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4' },
          React.createElement('i', { className: 'fas fa-rocket text-2xl text-white' })
        ),
        React.createElement('h2', { className: 'text-2xl font-bold dark:text-white' }, 'Start Your Free Trial'),
        React.createElement('p', { className: 'text-gray-500' }, '14 days free, no credit card required')
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'Full Name'),
          React.createElement('div', { className: 'relative' },
            React.createElement('i', { className: 'fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' }),
            React.createElement('input', {
              type: 'text',
              value: name,
              onChange: function(e) { setName(e.target.value); },
              className: 'w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white',
              placeholder: 'John Doe',
              disabled: loading
            })
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'Email'),
          React.createElement('div', { className: 'relative' },
            React.createElement('i', { className: 'fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' }),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: function(e) { setEmail(e.target.value); },
              className: 'w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white',
              placeholder: 'your@email.com',
              disabled: loading
            })
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'Password'),
          React.createElement('div', { className: 'relative' },
            React.createElement('i', { className: 'fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' }),
            React.createElement('input', {
              type: showPw ? 'text' : 'password',
              value: password,
              onChange: function(e) { setPassword(e.target.value); },
              className: 'w-full pl-12 pr-12 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white',
              placeholder: 'Create a strong password',
              disabled: loading
            }),
            React.createElement('button', {
              type: 'button',
              onClick: function() { setShowPw(!showPw); },
              className: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400',
              tabIndex: -1
            },
              React.createElement('i', { className: 'fas ' + (showPw ? 'fa-eye-slash' : 'fa-eye') })
            )
          ),
          React.createElement(PasswordStrength, { password: password })
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium mb-2 dark:text-gray-300' }, 'Business Name (Optional)'),
          React.createElement('div', { className: 'relative' },
            React.createElement('i', { className: 'fas fa-building absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' }),
            React.createElement('input', {
              type: 'text',
              value: business,
              onChange: function(e) { setBusiness(e.target.value); },
              className: 'w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white',
              placeholder: 'Your Business Inc.',
              disabled: loading
            })
          )
        ),
        React.createElement('div', { className: 'mb-6' },
          React.createElement('label', { className: 'flex items-start text-sm text-gray-600 dark:text-gray-400' },
            React.createElement('input', {
              type: 'checkbox',
              checked: agreed,
              onChange: function(e) { setAgreed(e.target.checked); },
              className: 'mr-2 mt-1 rounded',
              disabled: loading
            }),
            React.createElement('span', null,
              'I agree to the ',
              React.createElement('a', { href: '#', className: 'text-indigo-600 hover:underline' }, 'Terms of Service'),
              ' and ',
              React.createElement('a', { href: '#', className: 'text-indigo-600 hover:underline' }, 'Privacy Policy')
            )
          )
        ),
        React.createElement('button', {
          type: 'submit',
          disabled: loading || !agreed,
          className: 'w-full gradient-bg text-white py-3 rounded-lg font-semibold transition flex items-center justify-center ' + (loading || !agreed ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90')
        },
          loading ?
            React.createElement(React.Fragment, null,
              React.createElement('span', { className: 'spinner mr-2' }),
              'Creating account...'
            ) :
            'Create Account'
        )
      ),
      React.createElement('div', { className: 'mt-6 text-center' },
        React.createElement('p', { className: 'text-gray-500' },
          'Already have an account? ',
          React.createElement('button', {
            onClick: function() { app.setSection('login'); },
            className: 'text-indigo-600 font-semibold hover:underline'
          }, 'Sign In')
        )
      ),
      React.createElement('button', {
        onClick: function() { app.setSection('landing'); },
        className: 'mt-4 w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center justify-center'
      },
        React.createElement('i', { className: 'fas fa-arrow-left mr-2' }),
        'Back to Home'
      )
    )
  );
};
