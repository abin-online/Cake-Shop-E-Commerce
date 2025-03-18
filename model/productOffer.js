const mongoose = require('mongoose')

const productOfferSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'products'
    },
    productName: {
        type: String,
        required: true
    },
    productOfferPercentage: {
        type: Number,
        min: 5,
        max: 90,
        required: true
    },
    discountPrice: {
        type: Number
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    currentStatus: {
        type: Boolean,
        required: false,
        default: true
    },

}, { timestamps: true })

const productOffer = mongoose.model('productOffers', productOfferSchema)

module.exports = productOffer