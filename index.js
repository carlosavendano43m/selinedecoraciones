const express = require('express')
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')
const Port = process.env.PORT || 3443;
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
//const cron = require('node-cron');

/*cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
});*/
require('dotenv').config({path:'variables.env'});
/*passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3443/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));*/
const connectDB = require ('./config/database');
connectDB();
// body parser
app.use(bodyParser.json())
const rutasuser = require('./routes/user');
const rutaspublicas = require('./routes/public');
const rutaslogin = require('./routes/auth');
const rutasprivadas = require('./routes/private');
const rutaswebpay = require('./routes/webpay');
const rutasnotification = require('./routes/notification');
const rutaspaypal = require('./routes/paypal');
/// use /////
app.use(express.json({extended:true}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(cors());
app.use(rutasuser);
app.use(rutaspublicas);
app.use('/admin',rutasprivadas);
app.use(rutaslogin);
app.use(rutaswebpay);
app.use(rutasnotification);
app.use('/paypal',rutaspaypal);

app.listen(Port,()=>{
    console.log('Servidor iniciado',Port);
})