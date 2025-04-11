const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);
console.log(process.env.MONGODB)
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
