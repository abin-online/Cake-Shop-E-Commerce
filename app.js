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
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const nocache = require('nocache')
const multer = require('multer')
const swal=require('sweetalert')
const moment = require('moment');

 require('dotenv').config()

 mongoose.set('strictQuery', false);
 mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
 .then(() => {
   console.log('MongoDB connected');
 })
 .catch(err => {
   console.error('MongoDB connection error:', err);
 });

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
// const { handlebars } = require('hbs');

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


Handlebars.registerHelper('ifeq', function (a, b, options) {
  if (a == b) { return options.fn(this); }
  return options.inverse(this);
});


Handlebars.registerHelper('ifnoteq', function (a, b, options) {
  if (a != b) { return options.fn(this); }
  return options.inverse(this);
});


Handlebars.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (let i = from; i <= to; i += incr) {
    accum += block.fn(i);
  }
  return accum;

})


Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if (v1 === v2) {
    return options.fn ? options.fn(this) : options.fn;
  } else {
    return options.inverse ? options.inverse(this) : options.inverse
  }
})

Handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifeq', function (a, b, options) {
  if (a == b) { return options.fn(this); }
  return options.inverse(this);
});


Handlebars.registerHelper('add', function (a, b) {
  return a+b
});

Handlebars.registerHelper('increment', function(index) {
  return index + 1;
});

// Define a Handlebars helper
Handlebars.registerHelper('ifFirst', function(index, options) {
  if (index === 0) {
      return options.fn(this); // Return content inside the block
  } else {
      return options.inverse(this); // Return if not first
  }
});


Handlebars.registerHelper('formatDate', function (timestamp) {
  return moment(timestamp).format(' D,MMMM, YYYY');
});
Handlebars.registerHelper('formatTime', function (timestamp) {
  return moment(timestamp).format(' h:mm A');
});


// hbs.registerHelper("json", function (context) {
//   return JSON.stringify(context)
// })


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
// app.use(multer({dest: 'uploads', storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler

app.use(function(req, res, next) {
  res.status(404).render('404');
});


// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });



app.use(function(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
});
 

app.listen(process.env.PORT)
