/* ================================================================== */
/*  contexts.js — Theme Context + App Context with proper auth flow    */
/* ================================================================== */

var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useCallback = React.useCallback;
var useMemo = React.useMemo;
var createContext = React.createContext;
var useContext = React.useContext;

/* ---------- Theme Context ---------- */
window.ThemeCtx = createContext();

window.ThemeProvider = function(props) {
  var _s = useState(function() {
    var s = localStorage.getItem('darkMode');
    return s === 'true' || (!s && window.matchMedia('(prefers-color-scheme:dark)').matches);
  });
  var dark = _s[0], setDark = _s[1];

  useEffect(function() {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  var value = { dark: dark, toggle: function() { setDark(function(d) { return !d; }); } };
  return React.createElement(ThemeCtx.Provider, { value: value }, props.children);
};

window.useTheme = function() { return useContext(ThemeCtx); };

/* ---------- App Context ---------- */
window.AppCtx = createContext();

window.AppProvider = function(props) {
  // Authentication state
  var _u = useState(null);
  var user = _u[0], setUser = _u[1];

  // App data state
  var _c = useState([]);
  var clients = _c[0], setClients = _c[1];

  var _i = useState([]);
  var invoices = _i[0], setInvoices = _i[1];

  var _s = useState({});
  var settings = _s[0], setSettings = _s[1];

  // UI state
  var _sec = useState('landing');
  var section = _sec[0], setSection = _sec[1];

  var _dt = useState('overview');
  var dashTab = _dt[0], setDashTab = _dt[1];

  var _t = useState(null);
  var toast = _t[0], setToast = _t[1];

  // Loading and auth states
  var _loading = useState(true);  // Start in loading state
  var isLoading = _loading[0], setIsLoading = _loading[1];

  var _auth = useState(false);
  var isAuthenticated = _auth[0], setIsAuthenticated = _auth[1];

  var _authChecked = useState(false);
  var authChecked = _authChecked[0], setAuthChecked = _authChecked[1];

  // Boot sequence: Check auth on app mount
  useEffect(function() {
    var bootApp = async function() {
      setIsLoading(true);
      try {
        // Call /api/auth/me to check if user is already authenticated
        var meRes = await Backend.me();
        
        if (meRes && meRes.user) {
          // User is authenticated - set state
          setUser(meRes.user);
          setSettings(meRes.settings || {});
          setIsAuthenticated(true);
          
          // Load user data in background
          try {
            var clientsRes = await Backend.getClients();
            setClients(clientsRes.clients || []);
          } catch (err) {
            console.error('Error loading clients:', err);
          }
          
          try {
            var invoicesRes = await Backend.getInvoices();
            setInvoices(invoicesRes.invoices || []);
          } catch (err) {
            console.error('Error loading invoices:', err);
          }
          
          // Route to dashboard
          setSection('dashboard');
        } else {
          // No user data returned
          clearAuthState();
        }
      } catch (err) {
        // Auth failed - user is not authenticated
        console.log('Auth check failed (expected if not logged in):', err.message);
        clearAuthState();
      } finally {
        // Auth check is complete
        setAuthChecked(true);
        setIsLoading(false);
      }
    };
    
    var clearAuthState = function() {
      setUser(null);
      setClients([]);
      setInvoices([]);
      setSettings({});
      setIsAuthenticated(false);
      setSection('landing');
    };
    
    bootApp();
  }, []);

  // Utility functions
  var showToast = useCallback(function(message, type) {
    setToast({ message: message, type: type || 'success' });
    setTimeout(function() { setToast(null); }, 4000);
  }, []);

  var navigate = useCallback(function(sec, tab) {
    // Don't allow navigation to dashboard if not authenticated
    if (sec === 'dashboard' && !isAuthenticated) {
      setSection('login');
      showToast('Please login to continue', 'warning');
      return;
    }
    setSection(sec);
    if (tab) setDashTab(tab);
    if (sec === 'landing') {
      try { window.scrollTo(0, 0); } catch (e) {}
    }
  }, [isAuthenticated, showToast]);

  var login = useCallback(async function(email, password) {
    try {
      var res = await Backend.login(email, password);
      
      if (res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        
        // Load user data
        try {
          var clientsData = await Backend.getClients();
          setClients(clientsData.clients || []);
        } catch (err) {
          console.error('Error loading clients:', err);
        }
        
        try {
          var invoicesData = await Backend.getInvoices();
          setInvoices(invoicesData.invoices || []);
        } catch (err) {
          console.error('Error loading invoices:', err);
        }
        
        try {
          var settingsData = await Backend.getSettings();
          setSettings(settingsData.settings || {});
        } catch (err) {
          console.error('Error loading settings:', err);
        }
        
        setSection('dashboard');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      showToast(err.message || 'Login failed', 'error');
      return false;
    }
  }, [showToast]);

  var signup = useCallback(async function(name, email, password, businessName) {
    try {
      var res = await Backend.signup(name, email, password, businessName);
      
      if (res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        setClients([]);
        setInvoices([]);
        
        // Create default settings
        try {
          var settingsData = await Backend.getSettings();
          setSettings(settingsData.settings || {});
        } catch (err) {
          setSettings({});
        }
        
        setSection('dashboard');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Signup error:', err);
      showToast(err.message || 'Signup failed', 'error');
      return false;
    }
  }, [showToast]);

  var logout = useCallback(async function() {
    try {
      await Backend.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all state
      setUser(null);
      setIsAuthenticated(false);
      setClients([]);
      setInvoices([]);
      setSettings({});
      setSection('landing');
      showToast('Logged out', 'success');
    }
  }, [showToast]);

  var setState = useCallback(function(newState) {
    if (newState.user !== undefined) setUser(newState.user);
    if (newState.clients !== undefined) setClients(newState.clients);
    if (newState.invoices !== undefined) setInvoices(newState.invoices);
    if (newState.settings !== undefined) setSettings(newState.settings);
  }, []);

  // Build context value
  var value = useMemo(function() {
    return {
      // State
      user: user,
      clients: clients,
      invoices: invoices,
      settings: settings,
      section: section,
      dashTab: dashTab,
      toast: toast,
      isAuthenticated: isAuthenticated,
      isLoading: isLoading,
      authChecked: authChecked,
      
      // Methods
      setState: setState,
      setSection: navigate,
      setDashTab: setDashTab,
      showToast: showToast,
      login: login,
      signup: signup,
      logout: logout
    };
  }, [user, clients, invoices, settings, section, dashTab, toast, isAuthenticated, isLoading, authChecked, setState, navigate, showToast, login, signup, logout]);

  return React.createElement(AppCtx.Provider, { value: value }, props.children);
};

window.useApp = function() { return useContext(AppCtx); };
