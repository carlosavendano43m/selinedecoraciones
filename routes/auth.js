const express = require('express');
const router = express.Router();

var passport = require('passport');
const AuthUserController = require('../controllers/AuthUserController');

router.get('/check-email/:email',AuthUserController.checkEmail);
router.post('/sing-in',AuthUserController.singin);
router.post('/sing-up',AuthUserController.singup);
router.post('/forgot-password',AuthUserController.forgotPassword);
router.post('/refresh-user',AuthUserController.refreshUser);
router.post('/save-device',AuthUserController.saveDevice);

/*router.get('/auth/facebook',passport.authenticate('facebook'));
 router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(req);
    console.log(res);
    res.redirect('/');
  });*/




module.exports = router