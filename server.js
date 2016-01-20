// SETUP ==========================================================
var express     = require('express');
var app         = express();
var port        = process.env.PORT || 8080;
var mongoose    = require('mongoose');
var passport    = require('passport');
var flash       = require('connect-flash');

var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');

var configDB        = require('./config/database.js');

// CONFIGURE =====================================================
// we give the express application all this middleware so that we can access it in the
// req and res objects like flashdata and checking to make sure we're authenticated (see routes.js)

mongoose.connect(configDB.url); //connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
    app.use(morgan('dev')); // log every request to the console
    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(bodyParser()); // get information from html forms

    app.set('view engine', 'ejs'); //setup using ejs for templates

    // required for passport
    app.use(session({ secret: 'thebirthdaypartyismyfavouriteband' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    // Assume the client browser is sitting at public/, so to get the css, we just do
    // style.css (NOT, public/style.css)
    app.use(express.static(__dirname + '/public'));


// ROUTES =========================================================
require('./routes/routes.js')(app, passport);

//START ===========================================================
app.listen(port);
console.log("Listening on port " + port);