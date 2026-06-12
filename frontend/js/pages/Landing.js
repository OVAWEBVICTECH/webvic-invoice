/* ================================================================== */
/*  pages/Landing.js — Full Landing Page                              */
/*  Hero, Features, Pricing, Testimonials, About, Templates,          */
/*  Blog, Contact, CTA, Footer                                       */
/* ================================================================== */

window.LandingPage = function() {
    var app = useApp();
    var _p = React.useState('monthly');
    var pricing = _p[0], setPricing = _p[1];

    var handleContact = function(e) {
        e.preventDefault();
        app.showToast("Message sent! We'll get back to you within 24 hours.", 'success');
        e.target.reset();
    };

    /* ---- Data ---- */
    var features = [
        ['magic', 'AI Invoice Generator', 'Create professional invoices in seconds with smart templates and auto-fill features.'],
        ['bell', 'Auto Reminders', 'Automatic payment reminders sent at the right time to ensure timely payments.'],
        ['credit-card', 'Online Payments', 'Accept credit cards, PayPal, and bank transfers directly from invoices.'],
        ['sync', 'Recurring Invoices', 'Set up automatic recurring invoices for retainer clients and subscriptions.'],
        ['chart-line', 'Analytics Dashboard', 'Track your income, outstanding payments, and business health in real-time.'],
        ['shield-alt', 'Bank-Level Security', '256-bit encryption, 2FA, and GDPR compliance keep your data safe.']
    ];

    var testimonials = [
        { q: '"InvoiceFlow has transformed my freelance business. I get paid 50% faster now!"', n: 'Sarah Johnson', r: 'Freelance Designer', img: 5 },
        { q: '"The recurring invoice feature is amazing. I save hours every month."', n: 'Mike Chen', r: 'Web Developer', img: 12 },
        { q: '"Best investment for my agency. White-label makes us look super professional."', n: 'Emily Davis', r: 'Agency Owner', img: 20 }
    ];

    var aboutValues = [
        ['lightbulb', 'Built by Freelancers, for Freelancers', 'Our founding team spent years freelancing and understood the pain firsthand.'],
        ['globe', 'Global & Inclusive', 'Supporting multiple currencies, languages, and tax systems worldwide.'],
        ['shield-alt', 'Privacy & Security First', 'Your data is encrypted with bank-level security. Fully GDPR & SOC 2 compliant.'],
        ['hands-helping', 'Community Driven', 'Every feature shaped by our 50,000+ users community.']
    ];

    var team = [
        { n: 'Alex Rivera', r: 'CEO & Co-Founder', d: 'Ex-Stripe, 10+ yrs fintech', img: 33 },
        { n: 'Priya Sharma', r: 'CTO & Co-Founder', d: 'Ex-Google, systems architect', img: 47 },
        { n: 'Marcus Chen', r: 'Head of Design', d: 'Ex-Figma, award-winning UX', img: 26 },
        { n: 'Sara Okafor', r: 'VP of Growth', d: 'Ex-Shopify, growth expert', img: 44 }
    ];

    var templates = [
        { name: 'Modern Clean', tag: 'FREE', tagCls: 'bg-green-100 dark:bg-green-900 text-green-600', desc: 'Minimalist design with gradient accents.', uses: '12,400', rate: '4.9', gradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30' },
        { name: 'Classic Professional', tag: 'FREE', tagCls: 'bg-green-100 dark:bg-green-900 text-green-600', desc: 'Traditional layout with bold headers.', uses: '9,800', rate: '4.8', gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30' },
        { name: 'Creative Bold', tag: 'PRO', tagCls: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600', desc: 'Vibrant colors for creative professionals.', uses: '7,200', rate: '4.9', gradient: 'from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30' }
    ];

    var blogs = [
        { title: 'How to Create the Perfect Invoice: A Complete Guide', tag: 'GUIDE', tagCls: 'text-indigo-600', gradient: 'from-indigo-400 to-purple-500', icon: 'file-invoice-dollar', date: 'Dec 10, 2024', read: '8 min' },
        { title: '7 Proven Strategies to Eliminate Late Payments', tag: 'TIPS', tagCls: 'text-emerald-600', gradient: 'from-emerald-400 to-teal-500', icon: 'money-bill-wave', date: 'Dec 5, 2024', read: '6 min' },
        { title: 'Freelance Tax Guide 2025: What You Need to Know', tag: 'FREELANCING', tagCls: 'text-amber-600', gradient: 'from-amber-400 to-orange-500', icon: 'chart-pie', date: 'Nov 28, 2024', read: '10 min' }
    ];

    var contactCards = [
        ['envelope', 'Email Us', 'We respond within 24 hours', 'support@invoiceflow.com'],
        ['comments', 'Live Chat', 'Available Mon-Fri, 9am-6pm EST', 'Start a conversation'],
        ['book', 'Help Center', 'Browse our knowledge base', 'Visit Help Center'],
        ['map-marker-alt', 'Office', 'San Francisco, CA', '100 Market Street, Suite 300']
    ];

    var particles = [
        { w: 4, l: '10%', t: '20%', d: 0 }, { w: 6, l: '20%', t: '60%', d: 2 },
        { w: 3, l: '70%', t: '30%', d: 4 }, { w: 5, l: '80%', t: '70%', d: 1 },
        { w: 4, l: '50%', t: '80%', d: 3 }, { w: 8, l: '90%', t: '20%', d: 5 }
    ];

    return <section>

        {/* ===== HERO ===== */}
        <div className="gradient-bg min-h-screen flex items-center pt-16 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(function(p, i) {
                    return <div key={i} className="particle rounded-full bg-white/20" style={{ left: p.l, top: p.t, animationDelay: p.d + 's', width: p.w * 4, height: p.w * 4 }}></div>;
                })}
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white animate-slide-up">
                        <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm mb-6 animate-float backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>#1 Invoice Software for Freelancers
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Get Paid Faster with <span className="text-yellow-300">Smart Invoicing</span></h1>
                        <p className="text-xl text-white/80 mb-8">Create professional invoices in seconds, automate payment reminders, and track your earnings. Join 50,000+ freelancers who get paid on time.</p>
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"><i className="fas fa-shield-alt text-green-400 mr-2"></i><span className="text-sm">256-bit SSL</span></div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"><i className="fas fa-lock text-green-400 mr-2"></i><span className="text-sm">GDPR Compliant</span></div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={function() { app.setSection('signup'); }} className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-yellow-300 transition shadow-xl text-lg hover:scale-105 flex items-center justify-center group">
                                Start Free Trial <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition"></i>
                            </button>
                            <button onClick={function() { app.showToast('Demo video coming soon!', 'info'); }} className="border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition flex items-center justify-center group">
                                <i className="fas fa-play mr-2 group-hover:scale-110 transition"></i>Watch Demo
                            </button>
                        </div>
                        <div className="flex items-center mt-8 space-x-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(function(i) { return <img key={i} src={"https://i.pravatar.cc/40?img=" + i} className="w-10 h-10 rounded-full border-2 border-white" alt="User" />; })}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-xs font-bold">+5K</div>
                            </div>
                            <div className="text-sm"><div className="flex text-yellow-300 text-lg">★★★★★</div><span className="text-white/80">4.9/5 from 2,000+ reviews</span></div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-all duration-500 animate-float hover-lift">
                            <div className="flex justify-between items-center mb-6">
                                <div><h3 className="font-bold text-gray-800 dark:text-white">Invoice #INV-2024-001</h3><p className="text-sm text-gray-500">Due: Dec 15, 2024</p></div>
                                <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center"><i className="fas fa-check-circle mr-1"></i>Paid</span>
                            </div>
                            <div className="border-t border-b dark:border-gray-700 py-4 my-4 space-y-3">
                                {[['Web Design Services', '$2,500'], ['Logo Design', '$500'], ['SEO Optimization', '$800']].map(function(item) {
                                    return <div key={item[0]} className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{item[0]}</span><span className="font-medium dark:text-white">{item[1]}</span></div>;
                                })}
                            </div>
                            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Total</span><span className="text-2xl font-bold gradient-text">$3,800</span></div>
                            <button className="w-full mt-4 gradient-bg text-white py-2 rounded-lg font-medium text-sm"><i className="fas fa-download mr-2"></i>Download PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ===== TRUSTED BY ===== */}
        <div className="bg-white dark:bg-gray-800 py-8 border-b dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-gray-500 mb-6 text-sm uppercase tracking-wider">Trusted by teams at</p>
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                    {['Shopify', 'Stripe', 'Notion', 'Figma', 'Vercel'].map(function(n) { return <span key={n} className="text-2xl font-bold text-gray-400">{n}</span>; })}
                </div>
            </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="bg-white dark:bg-gray-800 py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[['$2.5B', 'Invoices Processed'], ['50,000', 'Active Users'], ['99.9%', 'Uptime SLA'], ['3x', 'Faster Payments']].map(function(item) {
                        return <div key={item[1]} className="hover-lift p-6 rounded-2xl cursor-default"><div className="text-4xl font-bold gradient-text">{item[0]}</div><div className="text-gray-500 mt-2">{item[1]}</div></div>;
                    })}
                </div>
            </div>
        </div>

        {/* ===== FEATURES ===== */}
        <div id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">FEATURES</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">Everything You Need to <span className="gradient-text">Get Paid</span></h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Powerful features designed for freelancers, agencies, and small businesses.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map(function(f, i) {
                        return <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition group hover-lift animate-slide-up" style={{ animationDelay: i * 0.1 + 's' }}>
                            <div className="w-14 h-14 gradient-bg rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                <i className={"fas fa-" + f[0] + " text-2xl text-white"}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">{f[1]}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{f[2]}</p>
                        </div>;
                    })}
                </div>
            </div>
        </div>

        {/* ===== PRICING ===== */}
        <div id="pricing" className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">PRICING</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Start free, upgrade when you need more power.</p>
                    <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
                        <button onClick={function() { setPricing('monthly'); }} className={"px-6 py-2 rounded-full transition " + (pricing === 'monthly' ? 'gradient-bg text-white' : 'text-gray-600 dark:text-gray-300')}>Monthly</button>
                        <button onClick={function() { setPricing('yearly'); }} className={"px-6 py-2 rounded-full transition " + (pricing === 'yearly' ? 'gradient-bg text-white' : 'text-gray-600 dark:text-gray-300')}>Yearly <span className="text-green-500 text-sm font-bold">-20%</span></button>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Starter */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 transition hover-lift">
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Starter</h3>
                        <p className="text-gray-500 mb-6">Perfect for getting started</p>
                        <div className="mb-6"><span className="text-4xl font-bold dark:text-white">$0</span><span className="text-gray-500">/month</span></div>
                        <ul className="space-y-3 mb-8">
                            {[['check', '5 invoices/month', true], ['check', '2 clients', true], ['check', 'Basic templates', true], ['times', 'Payment reminders', false], ['times', 'Recurring invoices', false]].map(function(item, i) {
                                return <li key={i} className={"flex items-center " + (item[2] ? 'dark:text-gray-300' : 'text-gray-400')}><i className={"fas fa-" + item[0] + " " + (item[2] ? 'text-green-500' : 'text-gray-300') + " mr-3"}></i>{item[1]}</li>;
                            })}
                        </ul>
                        <button onClick={function() { app.setSection('signup'); }} className="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 transition">Get Started</button>
                    </div>
                    {/* Professional */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white transform scale-105 shadow-xl relative hover-lift">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center"><i className="fas fa-crown mr-1"></i>MOST POPULAR</div>
                        <h3 className="text-xl font-bold mb-2">Professional</h3>
                        <p className="text-white/70 mb-6">For growing freelancers</p>
                        <div className="mb-6"><span className="text-4xl font-bold">${pricing === 'monthly' ? 9 : 7}</span><span className="text-white/70">/month</span></div>
                        <ul className="space-y-3 mb-8">
                            {['Unlimited invoices', 'Unlimited clients', 'Premium templates', 'Auto reminders', 'Recurring invoices'].map(function(t) {
                                return <li key={t} className="flex items-center"><i className="fas fa-check text-yellow-300 mr-3"></i>{t}</li>;
                            })}
                        </ul>
                        <button onClick={function() { app.setSection('signup'); }} className="w-full py-3 bg-white text-indigo-600 rounded-full font-semibold hover:bg-yellow-300 transition">Start Free Trial</button>
                    </div>
                    {/* Business */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 transition hover-lift">
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Business</h3>
                        <p className="text-gray-500 mb-6">For teams & agencies</p>
                        <div className="mb-6"><span className="text-4xl font-bold dark:text-white">${pricing === 'monthly' ? 29 : 23}</span><span className="text-gray-500">/month</span></div>
                        <ul className="space-y-3 mb-8">
                            {['Everything in Pro', '5 team members', 'White-label invoices', 'Priority support', 'API access'].map(function(t) {
                                return <li key={t} className="flex items-center dark:text-gray-300"><i className="fas fa-check text-green-500 mr-3"></i>{t}</li>;
                            })}
                        </ul>
                        <button onClick={function() { app.setSection('signup'); }} className="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 transition">Get Started</button>
                    </div>
                </div>
            </div>
        </div>

        {/* ===== TESTIMONIALS ===== */}
        <div id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">TESTIMONIALS</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">Loved by <span className="gradient-text">Thousands</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map(function(t, i) {
                        return <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover-lift">
                            <div className="flex text-yellow-400 mb-4 text-lg">★★★★★</div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{t.q}</p>
                            <div className="flex items-center">
                                <img src={"https://i.pravatar.cc/50?img=" + t.img} className="w-12 h-12 rounded-full mr-4 ring-2 ring-indigo-500" alt={t.n} />
                                <div><div className="font-semibold dark:text-white">{t.n}</div><div className="text-sm text-gray-500">{t.r}</div></div>
                            </div>
                        </div>;
                    })}
                </div>
            </div>
        </div>

        {/* ===== ABOUT ===== */}
        <div id="about" className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">ABOUT US</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">The Story Behind <span className="gradient-text">InvoiceFlow</span></h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">We're on a mission to help freelancers and small businesses get paid faster.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative animate-slide-up">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
                            <div className="flex items-center mb-6">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4"><i className="fas fa-bullseye text-2xl"></i></div>
                                <div><h3 className="text-xl font-bold">Our Mission</h3><p className="text-white/70 text-sm">Since 2020</p></div>
                            </div>
                            <p className="text-white/90 leading-relaxed mb-6">We believe every freelancer deserves to be paid on time. InvoiceFlow was born from the frustration of chasing late payments.</p>
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                                {[['50K+', 'Users'], ['120+', 'Countries'], ['$2.5B', 'Processed']].map(function(item) {
                                    return <div key={item[1]} className="text-center"><div className="text-2xl font-bold">{item[0]}</div><div className="text-white/70 text-xs">{item[1]}</div></div>;
                                })}
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg animate-float"><i className="fas fa-heart text-3xl text-red-500"></i></div>
                    </div>
                    <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {aboutValues.map(function(item) {
                            return <div key={item[0]} className="flex items-start gap-5 group">
                                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition"><i className={"fas fa-" + item[0] + " text-white text-lg"}></i></div>
                                <div><h4 className="text-lg font-bold mb-2 dark:text-white">{item[1]}</h4><p className="text-gray-600 dark:text-gray-400">{item[2]}</p></div>
                            </div>;
                        })}
                    </div>
                </div>
                <div className="mt-20">
                    <h3 className="text-2xl font-bold text-center mb-10 dark:text-white">Meet Our <span className="gradient-text">Leadership</span></h3>
                    <div className="grid md:grid-cols-4 gap-8">
                        {team.map(function(p) {
                            return <div key={p.n} className="text-center hover-lift">
                                <img src={"https://i.pravatar.cc/120?img=" + p.img} className="w-24 h-24 rounded-2xl mx-auto mb-4 ring-4 ring-indigo-100 dark:ring-indigo-900" alt={p.n} />
                                <h4 className="font-bold dark:text-white">{p.n}</h4>
                                <p className="text-sm text-indigo-600">{p.r}</p>
                                <p className="text-xs text-gray-500 mt-2">{p.d}</p>
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        </div>

        {/* ===== TEMPLATES ===== */}
        <div id="templates" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">TEMPLATES</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">Professional Invoice <span className="gradient-text">Templates</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {templates.map(function(t) {
                        return <div key={t.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover-lift group">
                            <div className={"h-64 bg-gradient-to-br " + t.gradient + " p-6 relative flex items-center justify-center"}>
                                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-4 w-full h-full">
                                    <div className="space-y-3 mt-4">
                                        {[80, 60, 90, 50].map(function(w, i) {
                                            return <div key={i} className="flex justify-between"><div className="h-2 bg-gray-200 dark:bg-gray-600 rounded" style={{ width: w + '%' }}></div><div className="h-2 bg-gray-300 dark:bg-gray-500 rounded" style={{ width: (40 - i * 8) + '%' }}></div></div>;
                                        })}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button onClick={function() { app.setSection('signup'); }} className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition">Use Template</button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold dark:text-white">{t.name}</h3>
                                    <span className={"px-3 py-1 " + t.tagCls + " rounded-full text-xs font-semibold"}>{t.tag}</span>
                                </div>
                                <p className="text-gray-500 text-sm">{t.desc}</p>
                                <div className="flex items-center mt-4 text-sm text-gray-400">
                                    <i className="fas fa-download mr-1"></i>{t.uses} uses<span className="mx-2">·</span><i className="fas fa-star text-yellow-400 mr-1"></i>{t.rate}
                                </div>
                            </div>
                        </div>;
                    })}
                </div>
                <div className="text-center mt-12">
                    <button onClick={function() { app.setSection('signup'); }} className="gradient-bg text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition shadow-lg hover:scale-105">
                        <i className="fas fa-palette mr-2"></i>Browse All 20+ Templates
                    </button>
                </div>
            </div>
        </div>

        {/* ===== BLOG ===== */}
        <div id="blog" className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">BLOG</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">Latest from Our <span className="gradient-text">Blog</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {blogs.map(function(p, i) {
                        return <article key={i} className="bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden hover-lift group">
                            <div className={"h-48 bg-gradient-to-br " + p.gradient + " relative overflow-hidden"}>
                                <div className="absolute inset-0 flex items-center justify-center"><i className={"fas fa-" + p.icon + " text-6xl text-white/30"}></i></div>
                                <div className="absolute top-4 left-4"><span className={"bg-white/90 " + p.tagCls + " px-3 py-1 rounded-full text-xs font-bold"}>{p.tag}</span></div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-3"><i className="fas fa-calendar-alt mr-2 text-indigo-500"></i>{p.date}<span className="mx-2">·</span><i className="fas fa-clock mr-1"></i>{p.read} read</div>
                                <h3 className="text-lg font-bold mb-2 dark:text-white group-hover:text-indigo-600 transition">{p.title}</h3>
                                <a href="#" className="text-indigo-600 font-semibold text-sm hover:underline flex items-center">Read More <i className="fas fa-arrow-right ml-2"></i></a>
                            </div>
                        </article>;
                    })}
                </div>
            </div>
        </div>

        {/* ===== CONTACT ===== */}
        <div id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-4">CONTACT</span>
                    <h2 className="text-4xl font-bold mb-4 dark:text-white">Get in <span className="gradient-text">Touch</span></h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-slide-up">
                        <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center"><i className="fas fa-paper-plane text-indigo-600 mr-3"></i>Send us a Message</h3>
                        <form onSubmit={handleContact}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="block text-sm font-medium mb-2 dark:text-gray-300">First Name</label><input type="text" className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg" placeholder="John" required /></div>
                                <div><label className="block text-sm font-medium mb-2 dark:text-gray-300">Last Name</label><input type="text" className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg" placeholder="Doe" required /></div>
                            </div>
                            <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label><input type="email" className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg" placeholder="you@example.com" required /></div>
                            <div className="mb-4"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Subject</label><select className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg"><option>General Inquiry</option><option>Technical Support</option><option>Billing Question</option></select></div>
                            <div className="mb-6"><label className="block text-sm font-medium mb-2 dark:text-gray-300">Message</label><textarea className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg" rows={4} placeholder="How can we help?" required></textarea></div>
                            <button type="submit" className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center"><i className="fas fa-paper-plane mr-2"></i>Send Message</button>
                        </form>
                    </div>
                    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {contactCards.map(function(item) {
                            return <div key={item[0]} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover-lift">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0"><i className={"fas fa-" + item[0] + " text-white text-xl"}></i></div>
                                    <div><h4 className="font-bold dark:text-white">{item[1]}</h4><p className="text-gray-500 text-sm">{item[2]}</p><p className="text-indigo-600 font-medium text-sm">{item[3]}</p></div>
                                </div>
                            </div>;
                        })}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                            <h4 className="font-bold mb-3">Follow Us</h4>
                            <div className="flex space-x-3">
                                {['twitter', 'linkedin', 'instagram', 'youtube', 'github'].map(function(s) {
                                    return <a key={s} href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition hover:scale-110"><i className={"fab fa-" + s}></i></a>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="gradient-bg py-20 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Paid Faster?</h2>
                <p className="text-xl text-white/80 mb-8">Join 50,000+ freelancers and businesses.</p>
                <button onClick={function() { app.setSection('signup'); }} className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition shadow-xl pulse-glow hover:scale-105">
                    Start Your Free 14-Day Trial <i className="fas fa-arrow-right ml-2"></i>
                </button>
                <p className="text-white/60 mt-4 text-sm flex items-center justify-center"><i className="fas fa-lock mr-2"></i>No credit card required · Cancel anytime</p>
            </div>
        </div>

        {/* ===== FOOTER ===== */}
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mr-2"><i className="fas fa-file-invoice-dollar text-lg text-white"></i></div>
                            <span className="text-xl font-bold">InvoiceFlow</span>
                        </div>
                        <p className="text-gray-400 mb-4">The smartest way to invoice clients and get paid on time.</p>
                        <div className="flex items-center text-sm text-gray-400"><i className="fas fa-shield-alt text-green-500 mr-2"></i>SOC 2 Type II Certified</div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            {[['Features', 'features'], ['Pricing', 'pricing'], ['Templates', 'templates'], ['Reviews', 'testimonials']].map(function(item) {
                                return <li key={item[1]}><a href={"#" + item[1]} className="hover:text-white transition flex items-center"><i className="fas fa-chevron-right text-xs mr-2"></i>{item[0]}</a></li>;
                            })}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            {[['About', 'about'], ['Blog', 'blog'], ['Contact', 'contact'], ['Careers', '#']].map(function(item) {
                                return <li key={item[0]}><a href={"#" + item[1]} className="hover:text-white transition flex items-center"><i className="fas fa-chevron-right text-xs mr-2"></i>{item[0]}</a></li>;
                            })}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4 mb-4">
                            {['twitter', 'linkedin', 'github'].map(function(s) {
                                return <a key={s} href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition hover:scale-110"><i className={"fab fa-" + s}></i></a>;
                            })}
                        </div>
                        <p className="text-gray-400 text-sm">support@invoiceflow.com</p>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                    <p>&copy; 2024 InvoiceFlow. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">Security</a>
                    </div>
                </div>
            </div>
        </footer>
    </section>;
};
