const mongoose = require('mongoose')
const { array } = require('../middleware/multer')

const produtSchema = new mongoose.Schema({
 
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brand',
        required: true
    },
    imageUrl: {
        type: Array,
         required: true
    },

    
    stock: {
        type: Number,
        required: true
    },

    is_blocked: {
        type: Boolean,
        default: false,
    },

    isWishlisted: {
        type: Boolean,
        dafault: false
    },

    isOnCart: {
        type: Boolean,
        default: false,
    },
    popularity:{
        type:Number,
        default:0
    },
    
    bestSelling:{
        type:Number,
        default:0
    }

}, { timestamps: true })



module.exports = mongoose.model('Product', produtSchema)
