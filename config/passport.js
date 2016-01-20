
// All the configuration for passport is handled here in this file

// load things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User            = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport){

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done){
        done(null, user.id); //callback for what to do next
    });

    // used to deserialize the user from the session
    passport.deserializeUser(function(id, done){ //pass id to User model
        User.findById(id, function(err, user){  //we create a new method
            done(err, user); //callback for what to do next
        })
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        //by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true //allows us to pass back the entire request to the callback
    },
    function(req, email, password, done){

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() { //this is a node construct - do research

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' : email }, function(err, user){
                // if there are any errors, return the error
                if(err){
                    return done(err);
                }

                // check to see if theres already a user with that email
                if(user){

                    // Here's where we see flashmessages getting returned
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    // The user doesn't exist yet
                    // Create the user

                    var newUser     = new User();

                    // set local credentials
                    newUser.local.email     = email;
                    newUser.local.password  = newUser.generateHash(password);

                    // save the user
                    newUser.save(function(err){
                        if (err){
                            throw err;
                        }

                        return done(null, newUser);
                    })
                }
            });
        });
    }
    ));


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email and pass
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done){

        //find a user whose email is the same as the forms email
        User.findOne({'local.email' : email }, function(err, user){
           // if there are errors, return the error before anything
            if(err){
                return done(err);
            }

            // if no user found, hasn't registered
            if(!user){
                return done(null, false, req.flash('loginMessage', 'No user found under this email.'));
            }

            // found the user, but wrong password
            if(!user.validPassword(password)){
               return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }

            // otherwise, return successful user
            return done(null, user);
        });
    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL

        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                        //newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        //console.log("Facebook PROFILE!!!!!!!!!!!!!!!!!!!!!!!!!");
                        //console.log(profile);

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));

};