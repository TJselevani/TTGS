//passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const CustomStrategy = require('passport-custom').Strategy;

const { authenticateAdmin, authenticateLecturer, getUserById} = require('../controllers/passport');

passport.use('local-strategy', new LocalStrategy({ usernameField: 'adminName', passwordField: 'password' }, authenticateAdmin));
passport.use('custom-strategy', new CustomStrategy(authenticateLecturer));
passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser((_id, done) => { return done(null, getUserById(_id)) })



