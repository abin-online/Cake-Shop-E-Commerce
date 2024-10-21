const Handlebars = require('handlebars');
const moment = require('moment');

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

  
module.exports = Handlebars;
