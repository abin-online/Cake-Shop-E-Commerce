process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs')
const session = require('express-session')
const nocache = require('nocache')
const multer = require('multer')
const moment = require('moment');
require('./helpers/handlebarsHelper');
require('dotenv').config()

moment.defaultFormat

//express app
const app = express();

//db connection
require('./config/dbConnection')

//routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

//configure handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', handlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'layout',
  partialsDir: __dirname + '/views/partials/'
}));


hbs.registerPartials(path.join(__dirname,'/views/partials'))


//session configuration
app.use(session({
  secret: process.env.SECRETKEY,
  saveUninitialized: true,
   cookie: { maxAge: 600000000 },
  resave: false 
}));


//middlware
app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

//define routes
app.use('/admin', adminRouter);
app.use('/', userRouter);

//error handling
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('404');
});

//general error handler
app.use(function(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
});
 

// Start the server
const PORT = process.env.PORT
//const PORT = "3001"

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});