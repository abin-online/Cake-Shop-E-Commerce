const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
 
    brand: {
        type: String,
        required: true
    },

    imageUrl:{
        type: String,
        required: true
    },

    isListed:{
        type:Boolean,
        default:true
    }
})



const Brand = mongoose.model('brand', brandSchema )
module.exports = Brand


