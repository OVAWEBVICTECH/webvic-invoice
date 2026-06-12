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
    var emptyState = { user: null, clients: [], invoices: [], settings: {} };
    var _s = useState(emptyState);
    var state = _s[0], setState = _s[1];

    var _sec = useState('landing');
    var section = _sec[0], setSection = _sec[1];

    var _dt = useState('overview');
    var dashTab = _dt[0], setDashTab = _dt[1];

    var _t = useState(null);
    var toast = _t[0], setToast = _t[1];

    var _ses = useState({ token: null, expiry: null });
    var session = _ses[0], setSession = _ses[1];

    var _init = useState(true);
    var initializing = _init[0], setInitializing = _init[1];

    var timerRef = useRef(null);

    var showToast = useCallback(function(message, type) {
        setToast({ message: message, type: type || 'success' });
        setTimeout(function() { setToast(null); }, 4000);
    }, []);

    var createSession = useCallback(function(token) {
        Backend.setToken(token || null);
        var expiry = Date.now() + 30 * 60 * 1000;
        setSession({ token: token || 'cookie', expiry: expiry });
        return token;
    }, []);

    var destroySession = useCallback(function() {
        Backend.setToken(null);
        setSession({ token: null, expiry: null });
    }, []);

    var refreshSession = useCallback(function() {
        setSession(function(s) {
            return s.token ? { token: s.token, expiry: Date.now() + 30 * 60 * 1000 } : s;
        });
    }, []);

    var isValidSession = useCallback(function() {
        return session.token && Date.now() < session.expiry;
    }, [session]);

    var setAuthState = useCallback(function(user, token) {
        var normalized = user ? Object.assign({}, user, { business: user.businessName || user.business || user.name }) : null;
        createSession(token);
        setState(function(prev) {
            return Object.assign({}, prev, {
                user: normalized,
                settings: Object.assign({}, prev.settings || {}, { business: normalized.business, email: normalized.email })
            });
        });
    }, [createSession]);

    var clearAuthState = useCallback(function() {
        destroySession();
        setState(emptyState);
    }, [destroySession]);

    var loadWorkspace = useCallback(async function(userOverride) {
        var user = userOverride || state.user;
        if (!user) return;
        var results = await Promise.all([Backend.clients.list(), Backend.invoices.list(), Backend.settings.get()]);
        var settings = Object.assign({}, results[2].settings || {}, {
            business: user.businessName || user.business || user.name,
            email: user.email
        });
        setState({
            user: Object.assign({}, user, { business: settings.business }),
            clients: results[0].clients || [],
            invoices: results[1].invoices || [],
            settings: settings
        });
    }, [state.user]);

    var logout = useCallback(async function() {
        try { await Backend.auth.logout(); } catch (e) { }
        clearAuthState();
        setSection('landing');
    }, [clearAuthState]);

    useEffect(function() {
        var cancelled = false;
        (async function() {
            try {
                var res = await Backend.auth.me();
                if (cancelled || !res.user) return;
                setAuthState(res.user, res.token || null);
                await loadWorkspace(res.user);
                if (!cancelled) setSection('dashboard');
            } catch (e) {
                clearAuthState();
            } finally {
                if (!cancelled) setInitializing(false);
            }
        })();
        return function() { cancelled = true; };
    }, []);

    // Refresh in-memory session expiry on user activity. The real auth source is the JWT/cookie issued by the API.
    useEffect(function() {
        var handler = function() { refreshSession(); };
        document.addEventListener('click', handler);
        document.addEventListener('keypress', handler);
        return function() {
            document.removeEventListener('click', handler);
            document.removeEventListener('keypress', handler);
        };
    }, [refreshSession]);

    // Auto-logout UI when the in-memory session timer expires.
    useEffect(function() {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!session.token) return;
        timerRef.current = setInterval(function() {
            if (Date.now() >= session.expiry) {
                logout();
                showToast('Session expired. Please login again.', 'warning');
            }
        }, 1000);
        return function() { clearInterval(timerRef.current); };
    }, [session, logout, showToast]);

    var navigate = useCallback(function(sec, tab) {
        if (sec === 'dashboard' && !session.token) {
            setSection('login');
            showToast('Please login to continue', 'warning');
            return;
        }
        setSection(sec);
        if (tab) setDashTab(tab);
        if (sec === 'landing') window.scrollTo(0, 0);
    }, [session, showToast]);

    var value = useMemo(function() {
        return {
            user: state.user, clients: state.clients, invoices: state.invoices, settings: state.settings,
            setState: setState, section: section, setSection: navigate,
            dashTab: dashTab, setDashTab: setDashTab,
            toast: toast, showToast: showToast,
            session: session, createSession: createSession,
            destroySession: destroySession, isValidSession: isValidSession,
            refreshSession: refreshSession, setAuthState: setAuthState,
            clearAuthState: clearAuthState, loadWorkspace: loadWorkspace,
            logout: logout, initializing: initializing
        };
    }, [state, setState, section, navigate, dashTab, toast, showToast, session, createSession, destroySession, isValidSession, refreshSession, setAuthState, clearAuthState, loadWorkspace, logout, initializing]);

    return React.createElement(AppCtx.Provider, { value: value }, props.children);
};

window.useApp = function() { return useContext(AppCtx); };
