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

  Handlebars.registerHelper('subtract', function(a, b) {
    return a - b;
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

  Handlebars.registerHelper('range', function(start, end) {
    const range = [];
    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
});
  
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper('neq', function (a, b) {
    console.log('Comparing:', a, 'with', b); // <-- Debug log
    return a !== b;
  });
  

  Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
});

Handlebars.registerHelper('lt', function (a, b) {
    return a < b;
});
  
  Handlebars.registerHelper('formatDate', function (timestamp) {
    return moment(timestamp).format(' D,MMMM, YYYY');
  });
  Handlebars.registerHelper('formatTime', function (timestamp) {
    return moment(timestamp).format(' h:mm A');
  });

  Handlebars.registerHelper('statuchecker',  function (value) {
    let ct=0
    let ct2=0
    let returnct= value.product.forEach((elem)=>{
        if(elem.isReturned)ct++
    })
    let returnct2= value.product.forEach((elem)=>{
        if(elem.isCancelled)ct2++
    })

    let allCancelled = value.product.every(product => product.isCancelled);
    let allReturned = value.product.every(product => product.isReturned);
    // if(ct>0 && value.status!=="Returned"){
    //    let change=   Order.findByIdAndUpdate(value._id, { $set: { status: 'Returned' } }, { new: true });
    // }

    if (value.status === "Delivered") {
        return new Handlebars.SafeString(`
            <button id="returnOrder" data-order-id="${value._id}" class="btn btn-sm btn-primary">Return Entire Order</button>
        `);
    } else if (value.status == "Returned") {
        return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Order Returned</span>');
    } else if (value.status === "Payment Failed") {       
      return new Handlebars.SafeString(`
        <button id="retryPayment" data-order-id="${value._id}" class="btn btn-sm btn-warning">Retry Payment</button>
      `);
    } 
    else {
        if (allCancelled || value.status === 'Cancelled') {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-danger text-danger">Order Cancelled</span>');
        } else if (ct>0 ) {
            return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Order Returned</span>');
        } else {
            return new Handlebars.SafeString(`
                <button id="cancelOrder" data-order-id="${value._id}" class="btn btn-sm btn-primary">Cancel Entire Order</button>
            `);
        }
    }
});

Handlebars.registerHelper('singlestatuchecker', function (product, options) {
  if (product.isReturned) {
      return new Handlebars.SafeString('<span class="badge rounded-pill alert-info text-info">Returned</span>');
  } else if (product.isCancelled) {
      return new Handlebars.SafeString('<span class="badge rounded-pill alert-danger text-danger">Cancelled</span>');
  } else {
      return options.fn(this);
  }
});

Handlebars.registerHelper('or', function (a, b) {
  return a || b;
});


  
module.exports = Handlebars;
