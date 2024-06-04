// models/reviewSchema.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    productId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    // rating: {
    //     type: Number,
    //     required: true,
    //     min: 1,
    //     max: 5
    // },

    comment: {
        type: String,
        required: true
    },

   
});

module.exports = mongoose.model('Review', reviewSchema);