const mongoose = require('mongoose')

const categoryOfferSchema = new mongoose.Schema({
   
    categoryName: {
        type: String,
        required: true,
        
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
        ref: 'Category'
    },
    categoryOfferPercentage:{
        type: Number,
        min: 5,
        max: 90,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: new Date().toLocaleString()
    },
    endDate: {
        type: Date,
        required: true
    },
    currentStatus:{
        type: Boolean,
        required: false,
        default: true    
    },

},{timestamps:true})

const categoryOffer = mongoose.model('categoryOffers',categoryOfferSchema)

module.exports = categoryOffer