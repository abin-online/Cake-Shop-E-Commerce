const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    product_Id: 
    {
        type:mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required:true
    },
    quantity :{
        type:Number,
        required:true
    },
    value:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        default:0
    }

})

const Cart = mongoose.model('carts',CartSchema)
module.exports = Cart