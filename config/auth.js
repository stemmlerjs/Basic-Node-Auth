// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1644291075823663', // your App ID
        'clientSecret'  : '1ca58f63d438b5e3306e31d4f4b0eb92', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    }

};
