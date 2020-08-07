const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

var SocialUser       = require('../models/socialuser');

// load the auth variables
var configAuth = require('./auth');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });







 // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

      clientID        : configAuth.facebookAuth.clientID,
      clientSecret    : configAuth.facebookAuth.clientSecret,
      callbackURL     : configAuth.facebookAuth.callbackURL,
      profileFields: ['emails'],
      passReqToCallback : true,
      proxy:true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

  },
  function(req, token, refreshToken,profile, done) {

      // asynchronous
      process.nextTick(function() {



          // check if the user is already logged in
          if (!req.socialuser) {

               SocialUser.findOne({ 'facebook.id' : profile.id }, function(err, socialuser) {
                  if (err)
                      return done(err);

                  if (socialuser) {

                      return done(null, socialuser); // user found, return that user
                  } else {
                      // if there is no user, create them
                      var newSocialUser            = new SocialUser();

                      newSocialUser.facebook.id    = profile.id;
                      newSocialUser.facebook.token = token;
                      newSocialUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                      newSocialUser.facebook.email = profile.emails[0].value || null;

                      newSocialUser.save(function(err) {
                          if (err)
                              throw err;
                          return done(null, newSocialUser);
                      });
                  }
              });

          }
      });

  }));

  // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        proxy:true

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            SocialUser.findOne({ 'google.id' : profile.id }, function(err, socialuser) {
                if (err)
                    return done(err);

                if (socialuser) {

                    // if a user is found, log them in
                    return done(null, socialuser);
                } else {
                    // if the user isnt in our database, create a new user
                    var newSocialUser          = new SocialUser();

                    // set all of the relevant information
                    newSocialUser.google.id    = profile.id;
                    newSocialUser.google.token = token;
                    newSocialUser.google.name  = profile.displayName;
                    newSocialUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newSocialUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newSocialUser);
                    });
                }
            });
        });

    }));


}//module exports ending