if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express');
require('./middleware/passport');
const mongoose = require("mongoose");
const passport = require('passport')
const session = require('express-session')
const methodOverride = require('method-override')

const homeRoute = require('./routes/home');
const authRoute = require('./routes/auth')
const adminRoute = require('./routes/admin');
const lecturerRoute = require('./routes/lecturer'); 
const studentRoute = require('./routes/student');
const logoutRoute = require('./routes/logout');
const logOut = require('./controllers/logout.controller');

//express app
const app = express(); 

mongoose.set('strictQuery', false);
mongoose.connect(process.env.dbURI, {useNewUrlParser:true, useUnifiedTopology: true})
    .then(() => app.listen(process.env.PORT, () => {console.log(`Listening on Port ${process.env.PORT} && connected to db`)})) 
    .catch((error) => console.log('Error connecting to MongoDB:', error))
  
//Register View engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
  })

app.use( '/', homeRoute)
app.use( '/home', homeRoute)
app.use( '/auth', authRoute)
app.use( '/lecturer', lecturerRoute)
app.use( '/admin', adminRoute)
app.use( '/student', studentRoute)
app.use( '/logout', logoutRoute)
app.delete('/logout', logOut)

app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});