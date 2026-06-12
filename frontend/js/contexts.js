/* ================================================================== */
/*  contexts.js — Theme Context + App Context (global state)          */
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
    /* ---- Auth State ---- */
    var _u = useState(null);
    var user = _u[0], setUser = _u[1];

    var _auth = useState(false);
    var isAuthenticated = _auth[0], setIsAuthenticated = _auth[1];

    var _loading = useState(true);
    var isLoading = _loading[0], setIsLoading = _loading[1];

    /* ---- App Data ---- */
    var _c = useState([]);
    var clients = _c[0], setClients = _c[1];

    var _i = useState([]);
    var invoices = _i[0], setInvoices = _i[1];

    var _s = useState({});
    var settings = _s[0], setSettings = _s[1];

    /* ---- UI State ---- */
    var _sec = useState('landing');
    var section = _sec[0], setSection = _sec[1];

    var _dt = useState('overview');
    var dashTab = _dt[0], setDashTab = _dt[1];

    var _t = useState(null);
    var toast = _t[0], setToast = _t[1];

    var _authCheckDone = useState(false);
    var authCheckDone = _authCheckDone[0], setAuthCheckDone = _authCheckDone[1];

    /* ---- Boot Sequence: Check /api/auth/me on mount ---- */
    useEffect(function() {
        var bootApp = async function() {
            try {
                var res = await Backend.me();
                setUser(res.user);
                setSettings(res.settings || {});
                setIsAuthenticated(true);

                /* Load user data after auth confirmed */
                try {
                    var clientsRes = await Backend.getClients();
                    setClients(clientsRes.clients || []);
                } catch (err) {
                    console.error('Failed to load clients:', err);
                }

                try {
                    var invoicesRes = await Backend.getInvoices();
                    setInvoices(invoicesRes.invoices || []);
                } catch (err) {
                    console.error('Failed to load invoices:', err);
                }

                setSection('dashboard');
            } catch (err) {
                /* Auth failed — user not logged in */
                setUser(null);
                setIsAuthenticated(false);
                setClients([]);
                setInvoices([]);
                setSettings({});
                setSection('landing');
            } finally {
                /* Auth check is complete — allow UI to render */
                setAuthCheckDone(true);
                setIsLoading(false);
            }
        };

        bootApp();
    }, []);

    var showToast = useCallback(function(message, type) {
        setToast({ message: message, type: type || 'success' });
        setTimeout(function() { setToast(null); }, 4000);
    }, []);

    var login = useCallback(async function(email, password) {
        try {
            var res = await Backend.login(email, password);
            setUser(res.user);
            setIsAuthenticated(true);

            /* Load user data */
            var clientsRes = await Backend.getClients();
            setClients(clientsRes.clients || []);

            var invoicesRes = await Backend.getInvoices();
            setInvoices(invoicesRes.invoices || []);

            var settingsRes = await Backend.getSettings();
            setSettings(settingsRes.settings || {});

            setSection('dashboard');
            return true;
        } catch (err) {
            showToast(err.message || 'Login failed', 'error');
            return false;
        }
    }, [showToast]);

    var signup = useCallback(async function(name, email, password, businessName) {
        try {
            var res = await Backend.signup(name, email, password, businessName);
            setUser(res.user);
            setIsAuthenticated(true);
            setClients([]);
            setInvoices([]);
            setSettings({});
            setSection('dashboard');
            return true;
        } catch (err) {
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
            /* Complete state clear */
            setUser(null);
            setIsAuthenticated(false);
            setClients([]);
            setInvoices([]);
            setSettings({});
            setSection('landing');
            setDashTab('overview');
            showToast('Logged out successfully', 'success');
        }
    }, [showToast]);

    var setState = useCallback(function(newState) {
        if (newState.user !== undefined) setUser(newState.user);
        if (newState.clients !== undefined) setClients(newState.clients);
        if (newState.invoices !== undefined) setInvoices(newState.invoices);
        if (newState.settings !== undefined) setSettings(newState.settings);
    }, []);

    var navigate = useCallback(function(sec, tab) {
        if (sec === 'dashboard' && !isAuthenticated) {
            setSection('login');
            showToast('Please login to continue', 'warning');
            return;
        }
        setSection(sec);
        if (tab) setDashTab(tab);
        if (sec === 'landing') window.scrollTo(0, 0);
    }, [isAuthenticated, showToast]);

    var value = useMemo(function() {
        return {
            user: user,
            clients: clients,
            invoices: invoices,
            settings: settings,
            isAuthenticated: isAuthenticated,
            isLoading: isLoading,
            authCheckDone: authCheckDone,
            setState: setState,
            section: section,
            setSection: navigate,
            dashTab: dashTab,
            setDashTab: setDashTab,
            toast: toast,
            showToast: showToast,
            login: login,
            signup: signup,
            logout: logout
        };
    }, [user, clients, invoices, settings, isAuthenticated, isLoading, authCheckDone, setState, section, navigate, dashTab, toast, showToast, login, signup, logout]);

    return React.createElement(AppCtx.Provider, { value: value }, props.children);
};

window.useApp = function() { return useContext(AppCtx); };
