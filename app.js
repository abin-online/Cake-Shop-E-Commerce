process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const createError = require('http-errors');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const hbs = require('hbs')
const session = require('express-session')
const exphbs = require('express-handlebars')
const nocache = require('nocache')
const multer = require('multer')
const swal=require('sweetalert')
const moment = require('moment');
const Handlebars = require('./helpers/handlebarsHelper');

moment.defaultFormat


require('dotenv').config()

 mongoose.set('strictQuery', false);
 mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
 .then(() => {
   console.log('connected');
 })
 .catch(err => {
   console.error('MongoDB connection error:', err);
 });

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();


let hbss = exphbs.create({})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', handlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'layout',
  partialsDir: __dirname + '/views/partials/'
}));


hbs.registerPartials(path.join(__dirname,'/views/partials'))

app.use(session({
  secret: process.env.SECRETKEY,
  saveUninitialized: true,
   cookie: { maxAge: 600000000 },
  resave: false 
}));


app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler

app.use(function(req, res, next) {
  res.status(404).render('404');
});



app.use(function(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
});
 

app.listen(process.env.PORT)
