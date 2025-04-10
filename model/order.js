const mongoose = require("mongoose");
const Schema = mongoose.Schema

const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  product: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      image: { type: String },
      isCancelled: { type: Boolean, default: false },
      isReturned: { type: Boolean, default: false },
      cancelledReason: {
        type: String,
        default: null
      },
      returnedReason: {
        type: String,
        default: null
      }
    },
  ],

  address: {
    type: String,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },

  discountAmt: {
    type: Number,
  },

  amountAfterDscnt: {
    type: Number,

  },
  coupon: {
    type: String,
  },
  couponUsed: {
    type: Boolean,
    default: false,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", 'Cancelled', 'Returned', 'Payment Failed'],
    default: "Pending",
  },

  date: {
    type: Date,
    default: Date.now,
  },

  cancelledReason: {
    type: String,
    default: null
  },
  
  returnedReason: {
    type: String,
    default: null
  }

});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;