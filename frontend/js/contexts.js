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
    var _s = useState(function() {
        var saved = window.Storage.load();
        return saved || { user: null, clients: [], invoices: [], settings: {} };
    });
    var state = _s[0], setState = _s[1];

    var _sec = useState('landing');
    var section = _sec[0], setSection = _sec[1];

    var _dt = useState('overview');
    var dashTab = _dt[0], setDashTab = _dt[1];

    var _t = useState(null);
    var toast = _t[0], setToast = _t[1];

    var _ses = useState({ token: null, expiry: null });
    var session = _ses[0], setSession = _ses[1];

    var timerRef = useRef(null);

    var persist = useCallback(function(s) {
        setState(s);
        window.Storage.save(s);
    }, []);

    var showToast = useCallback(function(message, type) {
        setToast({ message: message, type: type || 'success' });
        setTimeout(function() { setToast(null); }, 4000);
    }, []);

    var createSession = useCallback(function() {
        var token = Security.csrfToken();
        var expiry = Date.now() + 30 * 60 * 1000;
        setSession({ token: token, expiry: expiry });
        return token;
    }, []);

    var destroySession = useCallback(function() {
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

    // Refresh session on user activity
    useEffect(function() {
        var handler = function() { refreshSession(); };
        document.addEventListener('click', handler);
        document.addEventListener('keypress', handler);
        return function() {
            document.removeEventListener('click', handler);
            document.removeEventListener('keypress', handler);
        };
    }, [refreshSession]);

    // Auto-logout on session expiry
    useEffect(function() {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!session.token) return;
        timerRef.current = setInterval(function() {
            if (Date.now() >= session.expiry) {
                destroySession();
                persist({ user: null, clients: [], invoices: [], settings: {} });
                setSection('landing');
                showToast('Session expired. Please login again.', 'warning');
            }
        }, 1000);
        return function() { clearInterval(timerRef.current); };
    }, [session, destroySession, persist, showToast]);

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
            setState: persist, section: section, setSection: navigate,
            dashTab: dashTab, setDashTab: setDashTab,
            toast: toast, showToast: showToast,
            session: session, createSession: createSession,
            destroySession: destroySession, isValidSession: isValidSession,
            refreshSession: refreshSession
        };
    }, [state, persist, section, navigate, dashTab, toast, showToast, session, createSession, destroySession, isValidSession, refreshSession]);

    return React.createElement(AppCtx.Provider, { value: value }, props.children);
};

window.useApp = function() { return useContext(AppCtx); };
