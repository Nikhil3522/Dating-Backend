const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const user_credentials = require('../models/user_credentials');

// authentication using passport
passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  async function(email, password, done){
    try {
      
    const lowerCaseEmail = email.toLowerCase();

    const user = await user_credentials.findOne({ email: { $regex: new RegExp('^' + lowerCaseEmail + '$', 'i') } });

      if (!user) {
        return done(null, false);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
    user_credentials.findById(id).exec()
    .then(user => {
        if (!user) {
        return done(null, false);
        }

        return done(null, user);
    })
    .catch(err => {
        return done(err);
    });
});

// check if the user is authenticated
passport.checkAuthentication = function(req, res, next){
    // if the user is signed in, then pass on the request to the next function(controller's action)
    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not signed in
    // return res.redirect('/login');
    return res.status(401).json({
        ErrorMessage: "Authentication required to get response!"
    })
}

passport.setAuthenticatedUser = function(req, res, next){
    if (req.isAuthenticated()){
        // req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
        res.locals.user = req.user;
    }

    next();
}


module.exports = passport;