// const Address = require('../../model/address')
// const User = require('../../model/userModel')
// const Order = require('../../model/order')
// const Coupon = require('../../model/coupon')
// const Product = require('../../model/productModel')
// const Category = require('../../model/categoryModel')
// const Razorpay = require('razorpay');
// //const { log } = require('handlebars')
// require('dotenv').config();



// const loadCheckout = async (req, res) => {

//     // const userData = req.session.user
//     // const userId   = userData._id

//     const sessionData = req.session.user
//     const userId = sessionData._id
//     // const user = await User.findOne({ _id: userId }).lean()


//     // const addressData = await Address.find({ userId: userId }).lean()

//     // const userDataa = await User.findOne({ _id: userId }).populate("cart.product").lean()

//     const [user, addressData, userData , availableCoupons ] = await Promise.all([
//         User.findOne({ _id: userId }).lean(),
//         Address.find({ userId: userId }).lean(),
//         User.findOne({ _id: userId }).populate("cart.product").lean(),
//         Coupon.find({ expiryDate: { $gte: new Date() },usedBy: { $nin: [userId] }}).lean()
//       ]);
      
//     const cart = userData.cart


//     let subTotal = 0
//     cart.forEach((val) => {
//         val.total = val.product.price * val.quantity
//         subTotal += val.total
//     })


//     const now = new Date();
    
//     console.log(availableCoupons)

//     const couponList = await Coupon.find({}).lean()

//     res.render('user/checkout/checkout', { userData: user, cart, addressData, subTotal, couponList, availableCoupons })
// }



// const checkStock = async (req, res) => {
//     const userData = req.session.user;
//     const userId = userData._id;


//     const userDataa = await User.findOne({ _id: userId }).populate("cart.product").lean();
//     const cart = userDataa.cart;


//     let stock = [];
//     cart.forEach((el) => {
//         if ((el.product.stock - el.quantity) < 0) {
//             stock.push(el.product);
//         }
//     });


//     if (stock.length > 0) {
//         res.json(stock);
//     } else {
//         res.json('ok')
//     }
// };



// ///////////  Place order function /////////////


// const placeOrder = async (req, res) => {


//     try {
//         const userData = req.session.user
//         const userId = userData._id
//         const addressId = req.body.selectedAddress
//         const payMethod = req.body.selectedPayment
//         const userDataa = await User.findOne({ _id: userId }).populate("cart.product")
//         const cartPro = userDataa.cart

//         let subTotal = 0

//         cartPro.forEach((val) => {
//             val.total = val.product.price * val.quantity
//             subTotal += val.total
//         })


//         let productDet = cartPro.map(item => {
//             return {
//                 id: item.product._id,
//                 name: item.product.name,
//                 price: item.product.price,
//                 quantity: item.quantity,
//                 image: item.product.imageUrl[0],
//             }
//         })


//         const result = Math.random().toString(36).substring(2, 7);
//         const id = Math.floor(100000 + Math.random() * 900000);
//         const ordeId = result + id;



//         /// order saving function


//         let saveOrder = async () => {
//             console.log("..........copon data", req.body)
//             // Create the base order object
//             let orderData = {
//                 userId: userId,
//                 product: productDet,
//                 address: addressId,
//                 orderId: ordeId,
//                 total: subTotal,
//                 paymentMethod: payMethod
//             };

//             // Add status if req.body.status is true
//             if (req.body.status) {
//                 orderData.status = "Payment Failed";
//             }

//             // Check if couponData exists in the request body
//             if (req.body.couponData) {
//                 console.log("BODY REQ........................", req.body);
//                 // If couponData exists, add coupon-related properties
//                 orderData = {
//                     ...orderData,
//                     discountAmt: req.body.couponData.discountAmt,
//                     amountAfterDscnt: req.body.couponData.newTotal,
//                     coupon: req.body.couponData.couponVal
//                 };
//             }

//             // Create a new order instance with the constructed data
//             const order = new Order(orderData);

//             // Save the order
//             const ordered = await order.save();


//             let userDetails = await User.findById(userId)
//             let userCart = userDetails.cart

//             userCart.forEach(async item => {
//                 const productId = item.product
//                 const qty = item.quantity

//                 const product = await Product.findById(productId)
//                 const stock = product.stock
//                 const updatedStock = stock - qty


//                 await Product.updateOne(
//                     { _id: productId },
//                     {
//                         $set: { stock: updatedStock, isOnCart: false },
//                         $inc: { bestSelling: 1 }
//                     }
//                 );

//                 const populatedProd = await Product.findById(productId).populate("category").lean()
//                 await Category.updateMany({ _id: populatedProd.category._id }, { $inc: { bestselling: 1 } });

//             })


//             userDetails.cart = []
//             await userDetails.save()
//             console.log("___________", userDetails.cart);
//         }


//         if (addressId) {
//             if (payMethod === 'cash-on-delivery') {

//                 saveOrder()

//                 res.json({
//                     CODsucess: true,
//                     toal: subTotal
//                 })
//             }



//             if (payMethod === 'razorpay') {

//                 const amount = req.body.amount

//                 var instance = new Razorpay({
//                     key_id: process.env.RAZORPAY_ID,
//                     key_secret: process.env.RAZORPAY_SECRET
//                 })

//                 const order = await instance.orders.create({
//                     amount: amount * 100,
//                     currency: 'INR',
//                     receipt: 'Abin Babu',
//                 })

//                 saveOrder()

//                 res.json({
//                     razorPaySucess: true,
//                     order,
//                     amount,
//                 })


//             }

//             /// payment method wallet function


//             if (payMethod === 'wallet') {
//                 const newWallet = req.body.updateWallet
//                 const userData = req.session.user


//                 await User.findByIdAndUpdate(userId, { $set: { wallet: newWallet } }, { new: true })


//                 saveOrder()

//                 res.json(newWallet)
//             }
//         }


//     } catch (error) {
//         console.log(error);
//     }
// }





// const applyCoupon = async (req, res) => {
//     try {
//         const { couponVal, subTotal } = req.body;
//         const coupon = await Coupon.findOne({ code: couponVal });
//         const userId = req.session.user._id;

//         if (!coupon) {
//             return res.json({ status: 'invalid' });
//         } else if (coupon.expiryDate < new Date()) {
//             return res.json({ status: 'expired' });
//         } else if (coupon.usedBy.includes(userId)) {
//             return res.json({ status: 'already_used' });
//         } else {





//             let discountAmt = (subTotal * coupon.discount) / 100;

//             if (discountAmt > coupon.maxDiscountAmount) {
//                 discountAmt = coupon.maxDiscountAmount

//             }
//             const newTotal = subTotal - discountAmt

//             await Coupon.updateOne({ _id: coupon._id }, { $push: { usedBy: userId } });

//             return res.json({
//                 discountAmt,
//                 newTotal,
//                 discount: coupon.discount,
//                 status: 'applied',
//                 couponVal
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ status: 'error', error });
//     }
// };


// const removeCoupon = async (req, res) => {
//     try {
//         const { couponVal, subTotal } = req.body;
//         const coupon = await Coupon.findOne({ code: couponVal });
//         const userId = req.session.user._id;

//         if (!coupon) {
//             return res.json({ status: 'invalid' });
//         } else if (!coupon.usedBy.includes(userId)) {
//             return res.json({ status: 'not_used' });
//         } else {
//             // Remove user ID from usedBy array
//             await Coupon.updateOne({ _id: coupon._id }, { $pull: { usedBy: userId } });

//             // Calculate the new total by adding back the discount amount correctly
//             const discountAmt = 0;
//             const newTotal = subTotal;

//             return res.json({
//                 discountAmt,
//                 newTotal,
//                 discount: coupon.discount,
//                 status: 'removed',
//                 couponVal
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ status: 'error', error });
//     }
// };







// module.exports = {
//     loadCheckout,
//     placeOrder,
//     applyCoupon,
//     removeCoupon,
//     checkStock,
// }


const Cart = require("../../model/cart");
const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const User = require("../../model/userModel");
const Address = require("../../model/address");
const Order = require("../../model/order");
const Coupon = require("../../model/coupon");
const Razorpay = require('razorpay');
const HttpStatus = require('../../constants/httpStatus');

const mongoose = require("mongoose");
const ObjectId = require("mongoose");




// const loadCheckoutPage = async (req, res) => {
//   try {
//     let userData = await User.findById(req.session.user._id).lean();
//     const ID = new mongoose.Types.ObjectId(userData._id);

//     const addressData = await Address.find({ userId: userData._id }).lean();
//     let coupon = await Coupon.find().lean();

//     const subTotal = await Cart.aggregate([
//       {
//         $match: {
//           userId: ID,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$subTotal" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           total: 1,
//         },
//       },
//     ]);

//     let cart = await Cart.aggregate([
//       {
//         $match: {
//           userId: ID,
//         },
//       },
//       {
//         $lookup: {
//           from: "products",
//           foreignField: "_id",
//           localField: "product_Id",
//           as: "productData",
//         },
//       },
//       {
//         $unwind: {
//           path: "$productData",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "productoffers", 
//           localField: "productData._id",
//           foreignField: "productId",
//           as: "productOffer",
//         },
//       },
//       {
//         $unwind: {
//           path: "$productOffer",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           quantity: 1,
//           value: 1,
//           productName: "$productData.name",
//           productPrice: {
//             $cond: {
//               if: { $gt: [{ $ifNull: ["$productOffer.discountPrice", 0] }, 0] },
//               then: "$productOffer.discountPrice",
//               else: "$productData.price",
//             },
//           },
//           productDescription: "$productData.description",
//           productImage: "$productData.imageUrl",
//         },
//       },
//     ]);

//     console.log("final->.......",cart);
//     console.log("Subtotal:", subTotal);
//     const cartData = await Cart.find({ userId: ID }).lean();
//     console.log("Cart Data:", cartData);~
//     res.render("user/checkout", {
//       userData,
//       addressData,
//       subTotal: subTotal[0]?.total || 0, 
//       cart,
//       coupon,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(HttpStatus.InternalServerError).send("Internal Server Error");
//   }
// };

const loadCheckoutPage = async (req, res) => {
  try {
    const userId = req.session.user._id;
    let userData = await User.findById(userId).lean();
    const ID = new mongoose.Types.ObjectId(userId);

    // Fetch user address data
    const addressData = await Address.find({ userId }).lean();



    // Get the cart data to match product IDs and quantities
  const cartItems = await Cart.find({ userId: ID }).lean();

    const cartItemtoRender = await Cart.find({ userId: ID })
  .populate({
    path: "product_Id", // Populate product details
    model: "Product",
  })
  .lean(); 

  console.log("cartItems_______________________________",cartItems)
  
  console.log("cartItems_______________________________",cartItemtoRender)

    // If no items in cart, return an empty response for cart details
    if (!cartItems.length) {
      return res.render("user/checkout", {
        userData,
        addressData,
        subTotal: 0,
        cart: [],
        coupon,
      });
    }

    // Fetch all products that are in the user's cart from the Product collection
    const productIds = cartItems.map((item) => item.product_Id);
    const products = await Product.aggregate([
      {
        $match: { _id: { $in: productIds } },
      },
      {
        $lookup: {
          from: "productoffers", // Match product offers
          localField: "_id",
          foreignField: "productId",
          as: "productOffer",
        },
      },
      {
        $unwind: {
          path: "$productOffer",
          preserveNullAndEmptyArrays: true, // Include products without offers
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          stock:1,
          price: {
            $cond: {
              if: { $gt: [{ $ifNull: ["$productOffer.discountPrice", 0] }, 0] },
              then: "$productOffer.discountPrice",
              else: "$price",
            },
          },
          description: 1,
          imageUrl: 1,
        },
      },
    ]);

    // Combine cart quantities and product data
    const cart = cartItems.map((cartItem) => {
      const product = products.find((p) => p._id.equals(cartItem.product_Id));
      return {
        ...cartItem,
        productName: product?.name || "Unknown Product",
        productPrice: product?.price || 0,
        productStock: product?.stock,
        productDescription: product?.description || "No description available",
        productImage: product?.imageUrl || "default_image.png",
        value: (product?.price || 0) * cartItem.quantity,
      };
    });

    // Calculate the subtotal
    const subTotal = cart.reduce((total, item) => total + item.value, 0);

    console.log("Final Cart:", cart);
    console.log("Subtotal:", subTotal);

        // Fetch available coupons
        const coupon = await Coupon.find({minPurchase: {$lte: subTotal} , usedBy: {$nin : [userId]} }).lean();

    res.render("user/checkout/checkout", {
      userData,
      addressData,
      subTotal,
      cart,
      coupon,
    });
  } catch (error) {
    console.log("Error loading checkout page:", error.message);
    res.status(HttpStatus.InternalServerError).send("Internal Server Error");
  }
};



const placeorder = async (req, res) => {
  try {
    console.log("place order ", req.body);
    let userData = req.session.user;
    const ID = new mongoose.Types.ObjectId(userData._id);
    const addressId = req.body.selectedAddress;
    const payMethod = req.body.selectedPayment;
    const totalamount = req.body.amount;
    console.log("Request dot body  ", addressId, payMethod, totalamount);

    console.log('Coupon data:', req.body.couponData); 
    console.log('Coupon Name:', req.body.couponName); 

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const ordeId = result + id;

    const productInCart = await Cart.aggregate([
      {
        $match: {
          userId: ID,
        },
      },
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          localField: "product_Id",
          as: "productData",
        },
      },
      {
        $unwind: {
          path: "$productData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "productoffers",
          localField: "productData._id",
          foreignField: "productId",
          as: "productOffer",
        },
      },
      {
        $unwind: {
          path: "$productOffer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          product_Id: 1,
          userId: 1,
          quantity: 1,
          name: "$productData.name",
          productDescription: "$productData.description",
          image: "$productData.imageUrl",
          discountPrice:  {
            $cond: {
              if: { $gt: [{ $ifNull: ["$productOffer.discountPrice", 0] }, 0] }, 
              then: "$productOffer.discountPrice", 
              else: "$productData.price", 
            },
          },
          stock: "$productData.stock",
        },
      }
      
    ]);
    
 
    
    
    console.log("product in cart =======>",productInCart);

    let productDet = productInCart.map((item) => {
      return {
        _id: item.product_Id,
        name: item.name,
        price: item.discountPrice,
        quantity: item.quantity,
        image: item.image[0],
        stock: item.stock,
      };
    });



    console.log("aggregated cart prods-------->",productDet);

    for (let product of productDet) {
      if (product.quantity > product.stock) {
        return res.json({
          message: `Insufficient stock for product: ${product.name}. Available stock: ${product.stock}`,
        });
      }
    }

    console.log("stock...........>",'product.stock')

    // Apply coupon if present
    let finalTotal = totalamount;
    let discountAmt = 0;

    if (req.body.couponData) {
      console.log(req.body.couponData)
      finalTotal = req.body.couponData.newTotal;
      discountAmt = req.body.couponData.discountAmt;
    }

    const DELIVERY_CHARGE = 50;
    const grandTotal = finalTotal + DELIVERY_CHARGE;

    let saveOrder = async () => {
      console.log("paymentMethod", payMethod)
      const order = new Order({  
        userId: ID,
        product: productDet,
        address: addressId,
        orderId: ordeId,
        total: grandTotal,
        paymentMethod: payMethod,
        discountAmt: discountAmt,
        amountAfterDscnt: grandTotal,  
        coupon: req.body.couponName ? req.body.couponName : "",
        couponUsed: req.body.couponData ? true : false,
      });

      if (req.body.status) {
        order.status = "Payment Failed";
        console.log("Payment Failed  ", order.status)
    }

      const ordered = await order.save();
      console.log(ordered, "ordersaved DATAAAA");

      productDet.forEach(async (product) => {
        await Product.updateMany(
          { _id: product._id },
          { $inc: { stock: -product.quantity, bestSelling:1 } }
        );
      });
      productDet.forEach(async (product) => {
        const populatedProd= await Product.findById(product._id).populate("category").lean()
        await Category.updateMany({ _id: populatedProd.category._id }, { $inc: { bestSelling:1} });

    })

    // Mark the coupon as used after the order is placed
    if (req.body.couponData) {
      await Coupon.updateOne(
        { code: req.body.couponName },
        { $addToSet: { usedBy: ID } }
      );
    }


      const deletedCart = await Cart.deleteMany({
        userId: ID,
      }).lean();

      console.log(deletedCart, "deletedCart");
    };
//save order ends
    if (addressId) {
      if (payMethod === "cash-on-delivery") {
        console.log("CASH ON DELIVERY");
        await saveOrder();
        res.json({ COD: true });
      } else if (payMethod === "razorpay") {
        const amount = grandTotal;
        let instance = new Razorpay({
          key_id: "rzp_test_RgbHBDrROekluj",
          key_secret: "uRixJRQVnd8RCggLiHa5SEaG",
        });
        const order = await instance.orders.create({
          amount: amount * 100,
          currency: "INR",
          receipt: "Manikandan",
        });
        await saveOrder();

        res.json({
          razorPaySucess: true,
          order,
          amount,
        });
      } else if (payMethod === "wallet") {
        console.log('inside the wallettttttttttt')

        const newWallet = req.body.updateWallet;

        const userWallet = await User.findByIdAndUpdate(
          userData._id,
          { $set: { wallet: newWallet } },
          { new: true }
        );

        console.log("userwalet" , userWallet)

        const userHistory = await User.updateOne(
          {_id:userData._id},
          {
            $push:{
              history:{
                amount:grandTotal,
                status:"Amount Debited",
                date:Date.now()
              }
            }
          }
        )

        console.log("userHistory  ", userHistory)


        await saveOrder();

        res.json({ walletSucess: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(HttpStatus.InternalServerError).send("Internal Server Error");
  }
};




const orderSuccess = async (req, res) => {
  try {

    res.render("user/order_success", {
      title: "Order Placed",
      userData: req.session.user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(HttpStatus.InternalServerError).send("Internal Server Error");
  }
};



const validateCoupon = async (req, res) => {
  try {
    const { couponVal, subTotal } = req.body;
    console.log(couponVal, subTotal);
    const coupon = await Coupon.findOne({ code: couponVal });

    if (!coupon) {
      res.json("invalid");
    } else if (coupon.expiryDate < new Date()) {
      res.json("expired");
    } else if (subTotal < coupon.minPurchase) {
      res.json("Minimum Amount Required");
    } else {
      const couponId = coupon._id;
      const discount = coupon.discount;
      const userId = req.session.user._id;

      const isCpnAlredyUsed = await Coupon.findOne({
        _id: couponId,
        usedBy: { $in: [userId] },
      });

      if (isCpnAlredyUsed) {
        res.json("already used");
      } else {
        
        const discnt = Number(discount);
        const discountAmt = (subTotal * discnt) / 100;
        const newTotal = subTotal - discountAmt;

        const user = User.findById(userId);

        res.json({
          discountAmt,
          newTotal,
          discount,
          succes: "succes",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(HttpStatus.InternalServerError).send("Internal Server Error");
  }
};



const applyCoupon = async (req, res) => {
  try {
    const { couponVal, subTotal } = req.body;
    const coupon = await Coupon.findOne({ code: couponVal });
    const userId = req.session.user._id;

    if (!coupon) {
      return res.json({ status: "invalid" });
    } else if (coupon.expiryDate < new Date()) {
      return res.json({ status: "expired" });
    } else if (coupon.usedBy.includes(userId)) {
      return res.json({ status: "already_used" });
    } else if (subTotal < coupon.minPurchase) {
      return res.json({ status: "min_purchase_not_met" });
    } else {
  
      await Coupon.updateOne(
        { _id: coupon._id },
        { $addToSet: { usedBy: userId } }
      );

     
      let discountAmt = (subTotal * coupon.discount) / 100;
      if (discountAmt > coupon.maxDiscount) {
        discountAmt = coupon.maxDiscount;
      }
      const newTotal = subTotal - discountAmt;

      return res.json({
        discountAmt,
        newTotal,
        discount: coupon.discount,
        status: "applied",
        couponVal,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.InternalServerError).json({ status: "error", error });
  }
};



const removeCoupon = async (req, res) => {
  try {
    const { couponVal, subTotal } = req.body;
    const coupon = await Coupon.findOne({ code: couponVal });
    const userId = req.session.user._id;

    if (!coupon) {
      return res.json({ status: "invalid" });
    } else if (!coupon.usedBy.includes(userId)) {
      return res.json({ status: "not_used" });
    } else {
      await Coupon.updateOne(
        { _id: coupon._id },
        { $pull: { usedBy: userId } }
      );
      const discountAmt = 0;
      const newTotal = subTotal;

      return res.json({
        discountAmt,
        newTotal,
        discount: coupon.discount,
        status: "removed",
        couponVal,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatus.InternalServerError).json({ status: "error", error });
  }
};



module.exports = {
  loadCheckoutPage,
  placeorder,
  orderSuccess,
  validateCoupon,
  applyCoupon,
  removeCoupon,
};