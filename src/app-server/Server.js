define([
    "dojo/_base/declare",

    "app-server/Routes",
    "app-server/config/passport",
    "app-server/config/database",

    "dojo/node!express",
    "dojo/node!express-session",
    "dojo/node!body-parser",
    "dojo/node!cookie-parser",
    "dojo/node!mongoose",
    "dojo/node!passport",
    "dojo/node!connect-flash",
    "dojo/node!http"
], function (declare,
    Routes, configPassport, configDB,
    express, expressSession, bodyParser, cookieParser, mongoose, passport, flash, http) {
    return declare(null, {
        start: function () {
            var baseDir = dojoConfig.baseDir + "/src/";
            console.log("baseDir:" + baseDir);

            var app = express();
            //app.use(express.logger('dev')); // log every request to the console
            app.use(cookieParser()); // read cookies (needed for auth)
            //app.use(bodyParser()); // get information from html forms

            app.set('views', baseDir + "app-server/views/"); // set up ejs for templating
            app.set('view engine', 'ejs'); // set up ejs for templating

            mongoose.connect(configDB.url); // connect to our database
            configPassport(passport);
            app.use(expressSession({ secret: 'hpccShhh' })); // session secret
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(flash()); // use connect-flash for flash messages stored in session

            var router = express.Router();
            var routes = new Routes(router, passport);
            app.use(router);
            router.use(express.static(baseDir));
            var server = http.createServer(app);
            server.listen(8000);
    
        }
    });
});