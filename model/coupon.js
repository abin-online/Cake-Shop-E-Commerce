const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CouponSchema=new Schema({
    code: {
        type: String,
        required: true,
        unique: true
      },
    
      discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
    
      expiryDate: {
        type: Date,
        required: true
      }, 
    
      status: {
        type: Boolean,
        default : true
      },
    
      usedBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      minPurchase:{
        type:Number,
        required:true,
        min:0
      },
      maxDiscount:{
        type:Number,
        required:true,
        min:0
        },
    

})


const Coupon = mongoose.model('coupons',CouponSchema)

module.exports = Coupon