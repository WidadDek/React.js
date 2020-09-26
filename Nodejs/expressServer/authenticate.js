var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //validate 

passport.serializeUser(User.serializeUser()); // to support sessions
passport.deserializeUser(User.deserializeUser()); // to support sessions

exports.getToken = function(user) { //create token & send it back
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {}; //options for jwt based strategy
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //extracted from incoming request
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => { //second param is verify function, done is callback provided by pasport
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});
