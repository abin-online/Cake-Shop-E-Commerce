const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);
console.log(process.env.MONGODB)
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('DATABASE CONNECTED');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
