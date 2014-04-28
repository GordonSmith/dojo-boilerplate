define([
    "dojo/_base/declare",
    "dojo/_base/lang",

    "app-server/config/auth",

    "dojo/node!http-proxy"
], function (declare, lang, authConfig, httpProxy) {
    return declare(null, {
        constructor: function (router, passport) {
            this.eclwatchProxy = httpProxy.createProxyServer();

            this.router = router;
            this.passport = passport;
            this.normal();
            this.localAuth();
            this.facebookAuth();
            //this.twitterAuth();
            //this.googleAuth();
            this.router.use(this.isLoggedIn);
            this.fullapp();
            this.eclplayground();
            this.hpcc();
        },

        // route middleware to ensure user is logged in
        isLoggedIn: function (req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }

            res.redirect('/');
        },

        proxyToHPCC: function (req, res, target) {
            target = lang.mixin({
                protocol: "http",
                host: "localhost",
                port: 8002
            }, target || {});
            this.eclwatchProxy.web(req, res, {
                target: target,
                ws: true,
                agent: false,
                headers: {
                    Authorization: authConfig.hpccAuth.Authorization
                }
            });
        },

        normal: function () {
            this.router.get('/', function (req, res) {
                res.render('index.ejs');
            });
            this.router.get('/home', this.isLoggedIn, function (req, res) {
                res.render('home.ejs', {
                    user: req.user
                });
            });
            this.router.get('/profile', this.isLoggedIn, function (req, res) {
                res.render('profile.ejs', {
                    user: req.user
                });
            });
            this.router.get('/logout', function (req, res) {
                req.logout();
                res.redirect('/');
            });
        },

        fullapp: function () {
            var context = this;
            this.router.use("/fullapp", function (req, res, next) {
                req.url = "/WsEcl/res/query/roxie/fullapp/res" + req.url;
                context.proxyToHPCC(req, res);
            });
        },

        eclplayground: function () {
            var context = this;
            this.router.use("/eclwatch", function (req, res, next) {
                if (req.param("Widget") && req.param("Widget") !== "ECLPlaygroundWidget") {
                    res.send("You cannot leave the playground!");
                } else {
                    req.url = "/";
                    context.proxyToHPCC(req, res, {
                        port: 8010
                    });
                }
            });
        },

        hpcc: function () {
            var context = this;
            this.router.use("/esp/files", function (req, res, next) {
                if (req.param("Widget") && req.param("Widget") !== "ECLPlaygroundWidget") {
                    console.log("Requested Widget:  " + req.param("Widget"));
                } else {
                    var parts = req.url.split("/");
                    if (parts.length > 1) {
                        switch (parts[1]) {
                            case "dojo":
                            case "dojox":
                            case "dijit":
                            case "eclwatch":
                            case "d3":
                            case "topojson":
                            case "CodeMirror2":
                            case "dgrid":
                            case "xstyle":
                            case "put-selector":
                                req.url = "/esp/files" + req.url;
                                context.proxyToHPCC(req, res, {
                                    port: 8010
                                });
                                return;
                            default:
                                console.log("Requested Folder:  " + parts[1]);
                        }
                    }
                }
            });

            this.router.use("/WsEcl/submit/query/roxie", function (req, res, next) {
                req.url = "/WsEcl/submit/query/roxie" + req.url;
                context.proxyToHPCC(req, res);
            });

            this.router.use("/WsSMC", function (req, res, next) {
                req.url = "/WsSMC" + req.url;
                context.proxyToHPCC(req, res, {
                    port: 8010
                });
            });

            this.router.use("/WsTopology", function (req, res, next) {
                req.url = "/WsTopology" + req.url;
                context.proxyToHPCC(req, res, {
                    port: 8010
                });
            });

            this.router.use("/WsWorkunits", function (req, res, next) {
                req.url = "/WsWorkunits" + req.url;
                console.log(req.url);
                context.proxyToHPCC(req, res, {
                    port: 8010
                });
            });
        },

        localAuth: function () {
            this.router.get('/login', function (req, res) {
                res.render('login.ejs', { message: req.flash('loginMessage') });
            });

            // process the login form
            this.router.post('/login', this.passport.authenticate('local-login', {
                successRedirect: '/index.html', // redirect to the secure profile section
                failureRedirect: '/login', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

            // SIGNUP =================================
            // show the signup form
            this.router.get('/signup', function (req, res) {
                res.render('signup.ejs', { message: req.flash('signupMessage') });
            });

            // process the signup form
            this.router.post('/signup', this.passport.authenticate('local-signup', {
                successRedirect: '/index.html', // redirect to the secure profile section
                failureRedirect: '/signup', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

            // =============================================================================
            // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
            // =============================================================================

            // locally --------------------------------
            this.router.get('/connect/local', function (req, res) {
                res.render('connect-local.ejs', { message: req.flash('loginMessage') });
            });
            this.router.post('/connect/local', this.passport.authenticate('local-signup', {
                successRedirect: '/index.html', // redirect to the secure profile section
                failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

            // =============================================================================
            // UNLINK ACCOUNTS =============================================================
            // =============================================================================
            // used to unlink accounts. for social accounts, just remove the token
            // for local account, remove email and password
            // user account will stay active in case they want to reconnect in the future

            // local -----------------------------------
            this.router.get('/unlink/local', function (req, res) {
                var user = req.user;
                user.local.email = undefined;
                user.local.password = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
        },

        facebookAuth: function () {
            // LOGIN ===============================
            // show the login form
            // facebook -------------------------------

            // send to facebook to do the authentication
            this.router.get('/auth/facebook', this.passport.authenticate('facebook', { scope: 'email' }));

            // handle the callback after facebook has authenticated the user
            this.router.get('/auth/facebook/callback',
                this.passport.authenticate('facebook', {
                    successRedirect: '/index.html',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
            // =============================================================================

            // facebook -------------------------------

            // send to facebook to do the authentication
            this.router.get('/connect/facebook', this.passport.authorize('facebook', { scope: 'email' }));

            // handle the callback after facebook has authorized the user
            this.router.get('/connect/facebook/callback',
                this.passport.authorize('facebook', {
                    successRedirect: '/index.html',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // UNLINK ACCOUNTS =============================================================
            // =============================================================================
            // used to unlink accounts. for social accounts, just remove the token
            // for local account, remove email and password
            // user account will stay active in case they want to reconnect in the future

            // facebook -------------------------------
            this.router.get('/unlink/facebook', function (req, res) {
                var user = req.user;
                user.facebook.token = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });

        },
        twitterAuth: function () {
            // LOGIN ===============================
            // show the login form

            // twitter --------------------------------

            // send to twitter to do the authentication
            this.router.get('/auth/twitter', this.passport.authenticate('twitter', { scope: 'email' }));

            // handle the callback after twitter has authenticated the user
            this.router.get('/auth/twitter/callback',
                this.passport.authenticate('twitter', {
                    successRedirect: '/index.html',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
            // =============================================================================

            // twitter --------------------------------

            // send to twitter to do the authentication
            this.router.get('/connect/twitter', this.passport.authorize('twitter', { scope: 'email' }));

            // handle the callback after twitter has authorized the user
            this.router.get('/connect/twitter/callback',
                this.passport.authorize('twitter', {
                    successRedirect: '/index.html',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // UNLINK ACCOUNTS =============================================================
            // =============================================================================
            // used to unlink accounts. for social accounts, just remove the token
            // for local account, remove email and password
            // user account will stay active in case they want to reconnect in the future

            // twitter --------------------------------
            this.router.get('/unlink/twitter', function (req, res) {
                var user = req.user;
                user.twitter.token = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
        },

        googleAuth: function () {
            // LOGIN ===============================
            // show the login form

            // google ---------------------------------

            // send to google to do the authentication
            this.router.get('/auth/google', this.passport.authenticate('google', { scope: ['profile', 'email'] }));

            // the callback after google has authenticated the user
            this.router.get('/auth/google/callback',
                this.passport.authenticate('google', {
                    successRedirect: '/index.html',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
            // =============================================================================

            // google ---------------------------------

            // send to google to do the authentication
            this.router.get('/connect/google', this.passport.authorize('google', { scope: ['profile', 'email'] }));

            // the callback after google has authorized the user
            this.router.get('/connect/google/callback',
                this.passport.authorize('google', {
                    successRedirect: '/index.html',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // UNLINK ACCOUNTS =============================================================
            // =============================================================================
            // used to unlink accounts. for social accounts, just remove the token
            // for local account, remove email and password
            // user account will stay active in case they want to reconnect in the future

            // google ---------------------------------
            this.router.get('/unlink/google', function (req, res) {
                var user = req.user;
                user.google.token = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
        }
    });
});
