const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  line1: {
    type: String,
    required: true,
  },
  line2: {
    type: String,
    required: true,
  },
  line3: {
    type: String,
    required: true,
  },
  line4: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
