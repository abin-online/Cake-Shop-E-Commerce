// models/reviewSchema.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },

    name: {
        type: String,
        required: true
    },

    isListed: {
        type: Boolean,
        default: true
    },

    comment: {
        type: String,
        required: true
    },

   
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);