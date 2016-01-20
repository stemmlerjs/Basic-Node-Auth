module.exports = function(app, passport){

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res){
       res.render('index.ejs');
    });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/home/:username', function(req, res){
        res.render('dashboard.ejs');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res){

        //render the page and pass into the page any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    //process the login
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ===============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res){

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // (we've done all the heavy duty stuff in the passport.js,
    //      all we have to set here is where our failures and successes get redirected
     app.post('/signup', passport.authenticate('local-signup', {
         successRedirect : '/profile', // redirect to the secure profile screen
         failureRedirect : '/signup', // redirect back to the signup page if theres an error
         failureFlash : true    // allow flash message
     }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res){
        console.log(req.user);
       res.render('profile.ejs', {
          user: req.user //pass the user out of the session into the template
       });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res){
        req.logout();                   //middleware provided by passport
        res.redirect('/');
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


    // ====================================
    // FUNCTIONS ==========================
    // ====================================

    //routing middleware to make sure that a user is logged in
    function isLoggedIn(req, res, next){

        //if a user is authenticated, carry on
        if(req.isAuthenticated()){  //route middleware
            return next();
        }

        //otherwise, redirect them to the home page
        res.redirect('/');
    }




}; //end of module.exports