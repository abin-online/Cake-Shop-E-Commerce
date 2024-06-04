const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
 
    category: {
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
    },
    bestselling:{
        type:Number,
        default:0
    }
})



module.exports = mongoose.model('category', categorySchema )
