const Orders = require('../../model/order')
const Address = require('../../model/address')
const moment = require('moment')
const pdfkit = require('pdfkit')
const fs = require('fs')
const helper = require('../../helpers/user.helper')
const User = require('../../model/userModel')
const Product = require('../../model/productModel')

const path = require('path');
const easyinvoice = require('easyinvoice');
const Handlebars = require('handlebars');
const { handlebars } = require('hbs')
const { ObjectId } = require('mongodb')
const { ProductView } = require('./userController')
const { Console } = require('console')
const HttpStatus = require('../../constants/httpStatus');

const mongoose = require('mongoose');
const productOffer = require('../../model/productOffer')
const Coupon = require('../../model/coupon')







// const myOrders = async (req, res) => {
//   try {
//       const userData = req.session.user
//       const userId   = userData._id

//       const orders = await Orders.find({ userId })
//                                   .sort({ date: -1 })

//       const formattedOrders = orders.map(order => {
//           const formattedDate = moment(order.date).format('MMMM D, YYYY');
//           return { ...order.toObject(), date: formattedDate }
//       })

//       

//       res.render('user/my_orders', {
//           userData,
//           myOrders: formattedOrders || [],
//       })

//   } catch (error) {
//       
//   }
// }


const myOrders = async (req, res) => {
  try {
    const userData = req.session.user;
    const userId = userData._id;

    // Get page and limit from query parameters, defaulting to 1 and 10 respectively if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch the user's orders from the database with limit and skip, and sort them by date in descending order
    const orders = await Orders.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Count the total number of documents to calculate total pages
    const totalOrders = await Orders.countDocuments({ userId });
    const totalPages = Math.ceil(totalOrders / limit);

    // Format the date for each order
    const formattedOrders = orders.map(order => {
      const formattedDate = moment(order.date).format('MMMM D, YYYY');
      return { ...order.toObject(), date: formattedDate };
    });

    // Create an array of page numbers
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Render the orders page with the paginated and formatted orders
    res.render('user/my_orders', {
      userData,
      myOrders: formattedOrders || [],
      currentPage: page,
      totalPages,
      pages
    });

  } catch (error) {

    res.status(500).send('An error occurred while fetching orders');
  }
};



const filterOrders = async (req, res) => {

  try {
    const { orderType } = req.query
    const userData = req.session.user
    const userId = userData._id

    const orders = await Orders.find({ userId, status: orderType })
      .sort({ date: -1 })

    const formattedOrders = orders.map(order => {
      const formattedDate = moment(order.date).format('MMMM D, YYYY');
      return { ...order.toObject(), date: formattedDate }
    })



    res.json(formattedOrders)

  } catch (error) {

  }
}


// const orderDetails = async (req, res) => {
//   try {
//     const userData = req.session.user
//     const orderId = req.query.id

//     const myOrderDetails = await Orders.findById(orderId).lean()
//     const orderedProDet = myOrderDetails.product
//     const addressId = myOrderDetails.address

//     const address = await Address.findById(addressId).lean()

//     

//     res.render('user/order_Details', { myOrderDetails, orderedProDet, userData, address })
//   } catch (error) {
//     
//   }
// }

const orderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;
    const user = req.session.user;

    if (!user) {
      // If the user is not logged in, redirect to login
      return res.redirect('/login');
    }

    const userId = user._id;

    // Fetch user data and order details
    const userData = await User.findById(userId).lean();
    const myOrderDetails = await Orders.findById(orderId).lean();

    if (!myOrderDetails) {
      return res.status(400).send("Order not found");
    }

    // Check if the logged-in user is the owner of the order
    if (myOrderDetails.userId.toString() !== userId.toString()) {
      // If the user doesn't own the order, redirect them to an error page or home
      return res.redirect('/error'); // Or use an appropriate route
    }

    // Format the date
    myOrderDetails.date = moment(myOrderDetails.date).format('ddd MMM DD YYYY');

    // Fetch ordered product details
    const orderedProDet = await Orders.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
      { $unwind: "$product" },
      { $project: { _id: 1, product: 1 } }
    ]);

    // Fetch address
    const address = await Address.findOne({ userId: userId }).lean();

    // Fetch product offers for each product in the order
    const productIds = orderedProDet.map(item => item.product._id);
    const productOffers = await productOffer.find({
      productId: { $in: productIds },
      currentStatus: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();

    // Create a map for quick access to offers
    const offerMap = {};
    productOffers.forEach(offer => {
      offerMap[offer.productId] = offer;
    });

    // Enhance ordered products with pricing logic
    const enhancedOrderedProDet = orderedProDet.map(item => {
      const offer = offerMap[item.product._id];
      if (offer) {
        return {
          ...item,
          product: {
            ...item.product,
            discountPrice: offer.discountPrice,
            originalPrice: item.product.price,
          }
        };
      } else {
        return {
          ...item,
          product: {
            ...item.product,
            discountPrice: item.product.price,
            originalPrice: item.product.price,
          }
        };
      }
    });





    // Render the order details page for the correct user
    res.render("user/orderDetails", {
      totalprice: myOrderDetails.total,
      address,
      orderedProDet: enhancedOrderedProDet,
      myOrderDetails,
      userData
    });
  } catch (error) {

    res.status(500).send("Internal Server Error");
  }
};




const orderSuccess = (req, res) => {
  try {
    const userData = req.session.user
    res.render('user/order_sucess', { userData })
  } catch (error) {

  }
}

const payment_failed = (req, res) => {
  try {
    const userData = req.session.user
    res.render('user/paymentFailed', { userData })
  } catch (error) {

  }
}



const cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;

    console.log(req.body)
    const { reason } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HttpStatus.BadRequest).json({ error: 'Invalid order ID' });
    }

    const ID = new mongoose.Types.ObjectId(id);
    let notCancelledAmt = 0;

    let canceledOrder = await Orders.findOne({ _id: ID });

    if (!canceledOrder) {
      return res.status(HttpStatus.NotFound).json({ error: 'Order not found' });
    }

    const statusChanged = await Orders.updateOne({ _id: ID }, { $set: { status: 'Cancelled', cancelledReason: reason } });
    console.log(statusChanged)
    for (const product of canceledOrder.product) {
      if (!product.isCancelled) {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stock: product.quantity }, $set: { isCancelled: true } }
        );

        await Orders.updateOne(
          { _id: ID, 'product._id': product._id },
          { $set: { 'product.$.isCancelled': true } }
        );
      }


    }

    let couponAmountEach = 0
    if (canceledOrder.coupon) {
      couponAmountEach = canceledOrder.discountAmt / canceledOrder.product.length

    }


    if (['wallet', 'razorpay'].includes(canceledOrder.paymentMethod)) {
      for (const data of canceledOrder.product) {
        //await Product.updateOne({ _id: data._id }, { $inc: { stock: data.quantity } });
        if (!data.isCancelled && !data.isReturned) {
          await User.updateOne(
            { _id: req.session.user._id },
            { $inc: { wallet: (data.price * data.quantity) - couponAmountEach } }
          );
          notCancelledAmt += (data.price * data.quantity) - couponAmountEach;
        }
      }


      await User.updateOne(
        { _id: req.session.user._id },
        {
          $push: {
            history: {
              amount: notCancelledAmt,
              status: 'Refund Amount for Order Cancellation',
              date: Date.now()
            }
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Successfully cancelled Order'
    });
  } catch (error) {

    res.status(HttpStatus.InternalServerError).send('Internal Server Error');
  }
};




// Return entire order
const returnOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { reason } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    const ID = new mongoose.Types.ObjectId(id);


    const returnedOrder = await Orders.findByIdAndUpdate(ID, { $set: { returnedReason: reason } }, { new: true });

    res.json({
      success: true,
      message: 'Requested for returning order',
      returnedOrder
    });

  } catch (error) {

    res.status(HttpStatus.InternalServerError).send('Internal Server Error');
  }
};




// Cancel one product in an order
const cancelOneProduct = async (req, res) => {
  try {
    const { id, prodId, reason } = req.body;
    console.log(id, prodId)

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(prodId)) {
      return res.status(HttpStatus.BadRequest).json({ error: 'Invalid order or product ID' });
    }

    const ID = new mongoose.Types.ObjectId(id);
    const PRODID = new mongoose.Types.ObjectId(prodId);

    const updatedOrder = await Orders.findOneAndUpdate(
      { _id: ID, 'product._id': PRODID },
      { $set: { 'product.$.isCancelled': true, 'product.$.cancelledReason': reason } },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return res.status(HttpStatus.NotFound).json({ error: 'Order or product not found' });
    }

    const result = await Orders.findOne(
      { _id: ID, 'product._id': PRODID },
      { 'product.$': 1 }
    ).lean();

    const productQuantity = result.product[0].quantity;
    const productprice = result.product[0].price * productQuantity

    await Product.findOneAndUpdate(
      { _id: PRODID },
      { $inc: { stock: productQuantity } }
    );
    if (updatedOrder.couponUsed) {
      const coupon = await Coupon.findOne({ code: updatedOrder.coupon });
      const discountAmt = (productprice * coupon.discount) / 100;
      const newTotal = productprice - discountAmt;
      await User.updateOne(
        { _id: req.session.user._id },
        { $inc: { wallet: newTotal } }
      );

      await User.updateOne(
        { _id: req.session.user._id },
        {
          $push: {
            history: {
              amount: newTotal,
              status: `Refund Amount for Cancel ${result.product[0].name}`,
              date: Date.now()
            }
          }
        }
      );

    } else {
      await User.updateOne(
        { _id: req.session.user._id },
        { $inc: { wallet: productprice } }
      );
      await User.updateOne(
        { _id: req.session.user._id },
        {
          $push: {
            history: {
              amount: productprice,
              status: `Refund Amount for Cancel ${result.product[0].name}`,
              date: Date.now()
            }
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Successfully removed product'
    });
  } catch (error) {

    res.status(HttpStatus.InternalServerError).send('Internal Server Error');
  }
};





const returnOneProduct = async (req, res) => {
  try {
    const { id, prodId, reason } = req.body;
    console.log(id, prodId)

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(prodId)) {
      return res.status(HttpStatus.BadRequest).json({ error: 'Invalid order or product ID' });
    }

    const ID = new mongoose.Types.ObjectId(id);
    const PRODID = new mongoose.Types.ObjectId(prodId);

    const updatedOrder = await Orders.findOneAndUpdate(
      { _id: ID, 'product._id': PRODID },
      { $set: { 'product.$.returnedReason': reason } },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return res.status(HttpStatus.NotFound).json({ error: 'Order or product not found' });
    }


    res.json({
      success: true,
      message: 'Requested to return the product'
    });
  } catch (error) {

    res.status(HttpStatus.InternalServerError).send('Internal Server Error');
  }
}


const retryPayment = async (req, res) => {
  try {
    const id = req.params.id
    console.log("Retry Payment for order ID:", id)

    const updatedOrder = await Orders.findByIdAndUpdate(id, { $set: { status: 'pending' } })

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    res.json({
      success: true,
      message: "Payment status has been set to 'pending'.you can retry the payment",
      order: updatedOrder
    })
  } catch (error) {
    console.log(error)
  }
}



const getInvoice = async (req, res) => {
  try {
    const orderId = req.query.id;



    const order = await Orders.findById(orderId);
    console.log(order)
    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }

    const { userId, address: addressId } = order;

    const [user, address] = await Promise.all([
      User.findById(userId),
      Address.findById(addressId),
    ]);


    const products = order.product.map((product) => ({
      quantity: product.quantity.toString(),
      description: product.name,
      tax: product.tax,
      price: product.price,



    }));

    const date = moment(order.date).format('MMMM D, YYYY');




    if (!user || !address) {
      return res.status(404).send({ message: 'User or address not found' });
    }



    const data = {
      mode: "development",
      currency: 'USD',
      taxNotation: 'vat',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
      sender: {
        company: 'C@ke Shop',
        address: 'Chennai Central ',
        zip: '600020',
        city: 'Chennai',
        country: 'India',
      },
      client: {
        company: user.name,
        address: address.adressLine1,
        zip: address.pin,
        city: address.city,
        country: 'India',
      },

      information: {
        // Invoice number
        number: "2021.0001",
        // Invoice data
        date: date,
        // Invoice due date
        // duedate: "31-12-2021"
      },

      // invoiceNumber: '2023001',
      // invoiceDate: date,


      products: products

    };

    easyinvoice.createInvoice(data, function (result) {

      easyinvoice.createInvoice(data, function (result) {
        const fileName = 'invoice.pdf'
        const pdfBuffer = Buffer.from(result.pdf, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
        res.send(pdfBuffer);
      })

    });
  }

  catch (error) {
    res.sendStatus(500);
  }
};



module.exports = {
  myOrders,
  orderDetails,
  orderSuccess,
  cancelOrder,
  getInvoice,
  returnOrder,
  filterOrders,
  payment_failed,
  retryPayment,
  returnOneProduct,
  cancelOneProduct
}