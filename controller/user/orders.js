const Orders  = require('../../model/order')
const Address = require('../../model/address')
const moment  = require('moment')
const pdfkit  = require('pdfkit')
const fs      = require('fs')
const helper  = require('../../helpers/user.helper')
const User    = require('../../model/userModel')
const Product = require('../../model/productModel')

const path = require('path');
const easyinvoice = require('easyinvoice');
const Handlebars = require('handlebars');
const { handlebars } = require('hbs')
const { ObjectId } = require('mongodb')
const { ProductView } = require('./userController')
const { Console } = require('console')








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

//       console.log(formattedOrders);

//       res.render('user/my_orders', {
//           userData,
//           myOrders: formattedOrders || [],
//       })

//   } catch (error) {
//       console.log(error);
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
    console.log(error);
    res.status(500).send('An error occurred while fetching orders');
  }
};



const filterOrders = async (req, res) => {

  try {
    const { orderType } = req.query
    const userData = req.session.user
    const userId   = userData._id

    const orders = await Orders.find({ userId, status: orderType })
                                .sort({ date: -1 })

    const formattedOrders = orders.map(order => {
        const formattedDate = moment(order.date).format('MMMM D, YYYY');
        return { ...order.toObject(), date: formattedDate }
    })

    console.log(formattedOrders);

    res.json(formattedOrders)

  } catch (error) {
    console.log(error);
  }
}


 const orderDetails = async(req, res) => {
    try {
        const userData = req.session.user
        const orderId = req.query.id

        const myOrderDetails = await Orders.findById(orderId).lean()
        const orderedProDet  = myOrderDetails.product
        const addressId      = myOrderDetails.address

        const address        = await Address.findById(addressId).lean()

        console.log("mAYYII",myOrderDetails);
       
        res.render('user/order_Details', { myOrderDetails, orderedProDet, userData, address  })
    } catch (error) {
        console.log(error);
    }
 }




 const orderSuccess = (req, res) => {
    try {
      const userData = req.session.user
        res.render('user/order_sucess', {userData})
    } catch (error) {
        console.log(error);
    }
 }
 
 const payment_failed = (req, res) => {
  try {
    const userData = req.session.user
      res.render('user/paymentFailed', {userData})
  } catch (error) {
      console.log(error);
  }
}



 const cancelOrder = async(req, res) => {
  try {
      const id       = req.query.id
      const userData = req.session.user
      const userId   =  userData._id
      
      const { updateWallet, payMethod } = req.body

      const myOrderDetails = await Orders.findOne({_id:id},
        {
          total:1,
          amountAfterDscnt:1,
          _id : 0
        }
      ).lean()

      

      console.log("myOrderDetails",myOrderDetails,"myOrderDetails");
      let refundAmount
      if(myOrderDetails.amountAfterDscnt){
       refundAmount=myOrderDetails.amountAfterDscnt-50
      }else{
        refundAmount=myOrderDetails.total-50

      }



      if(payMethod === 'wallet' || payMethod === 'razorpay'){
        await User.findByIdAndUpdate( userId, { $set:{ wallet:updateWallet }}, { new:true })

        await User.updateOne(
          { _id: req.session.user._id },
          {
              $push: {
                  history: {
                      amount:refundAmount,
                      status: 'Refunded',
                      date: Date.now()
                  }
              }
          }
      );
      }

      let canceledOrder = await Orders.findOne({ _id: id });

      for (const product of canceledOrder.product) {
        await Product.updateOne(
            { _id: product.id },
            { $inc: { stock: product.quantity }}
        );
}


      for (const product of canceledOrder.product) {
            await Product.updateOne(
                { _id: product.id },
                { $inc: { stock: product.quantity }}
            );
    }

      await Orders.findByIdAndUpdate(id, { $set: { status: 'Cancelled' } }, { new: true });

      res.json('sucess')
  } catch (error) {
      console.log(error);
    }
 }




 
 const returnOrder = async(req, res) => {
    try {
        const id = req.query.id
        
      console.log("order id",id)
        await Orders.findByIdAndUpdate(id, { $set: { status: 'Returned' } }, { new: true });

        let returnedOrder = await Orders.findOne({ _id: id });
        console.log(returnedOrder)

        for (const product of returnedOrder.product) {
              await Product.updateOne(
                  { _id: product.id },
                  { $inc: { stock: product.quantity }}
              );
      }

        res.json('sucess')
    } catch (error) {
        console.log(error);
    }
 }


 const retryPayment = async(req, res) =>{
  try {

    const id = req.query.id

    
    // let Order = await Orders.find({_id: ObjectId(id)})

    //   var instance = new Razorpay({
    //       key_id: process.env.RAZORPAY_ID,
    //       key_secret: process.env.RAZORPAY_SECRET
    //   })

    //   const order = await instance.orders.create({
    //       amount: Order[0].total,
    //       currency: 'INR',
    //       receipt: 'Abin Babu',
    //   })

      await Orders.findByIdAndUpdate(id, { $set: { status: 'pending' } }, { new: true });

      res.json({
          razorPaySucess: true,
          order
      })


  
    
  } catch (error) {
    
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
        company: 'Coke Shop',
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
  console.log('PDF base64 string: ');
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
    retryPayment
}