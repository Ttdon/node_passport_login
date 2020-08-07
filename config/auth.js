module.exports = {

  'facebookAuth' : {
      'clientID'      : '174836217294263', //  App ID
      'clientSecret'  : '70a08d335847e43bb5dc9e91cb73fab4', //  App Secret
      'callbackURL'   : '/auth/facebook/callback'
      // 'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
      // 'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
  },

  'googleAuth' : {
      'clientID'      : '836472167867-442p09lv3e7s0o5qhmnf6qejj6l116nh.apps.googleusercontent.com',
      'clientSecret'  : '_Cg_57AuhwpWx4BI1yYZGwoF',
      'callbackURL'   : '/auth/google/callback'
  },


  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
};
