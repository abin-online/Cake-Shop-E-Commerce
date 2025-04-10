const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  },
  productId: {
      type: Array,
      ref: "products",
      required: true

  }
})


const Wishlist = mongoose.model("wishlist", wishlistSchema)

module.exports = Wishlist