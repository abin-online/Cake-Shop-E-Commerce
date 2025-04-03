const User    = require('../../model/userModel')
const Product = require('../../model/productModel')
const Swal    = require('sweetalert2')
const swal    =require('sweetalert')




//////////////  Add to cart ////////////



const addToCart = async (req, res) => {
  try {
    
    const userData  = req.session.user
    const proId     = req.query.id
    const userId    = userData._id



    const product = await Product.findById(proId).lean()

    const existed = await User.findOne({ _id: userId, 'cart.product': proId }).lean()

    if (existed) {
           await User.findOneAndUpdate(
        { _id: userId, 'cart.product': proId },
        { $inc: {'cart.$.quantity': 1 }},
        { new: true }
      )
        res.json({message : 'Item alredy in cart'})
     
    } else {
         await Product.findByIdAndUpdate(proId,  {isOnCart: true})
         await User.findByIdAndUpdate( userId,
        { $push: { cart: {product: product._id,}}},
        { new: true }
      )
        res.json({message : 'Item added to cart'})
    }

  } catch (error) {
    console.log(error.message);
  }

}




const loadCart = async (req, res) => {

  
  const id = req.session.user._id;
  const userData = await User.findById(id).lean();
  console.log(req.session.user)
  console.log(req.session.user)
  console.log(req.session.user)
  

  try {
  
    const {userId}   = req.params


    const user = await User.findOne({ _id: userId }).populate('cart.product').lean()
    console.log('user    ', user)
    const cart = user.cart; // Get the 'cart' array from the user document
    let objectIdString = user._id.toString().replace('ObjectId("', '').replace('")', '');
    console.log(objectIdString);

console.log('cart ', cart)
     let subTotal = 0
     cart.forEach((val) => {
      if (val.product) {
          val.total = val.product.price * val.quantity;
          subTotal += val.total;
      } else {
          val.product = { name: "Product has been deleted", price: 0, imageUrl: [] };
          val.total = 0;
      }
  });


  if(user.cart.length === 0){
    res.render('user/empty_cart', {userData , objectIdString})
  }else{
    res.render('user/cart', { userData, cart, subTotal , objectIdString})
  }
  } catch (error) {
    console.log(error)
    res.render('error')
  }
}



const removeCart = async (req, res) => {
 try {
  const userData = req.session.user
  const userId   = userData._id
  const proId    = req.query.proId
  const cartId   = req.query.cartId

  await Product.findOneAndUpdate(
    { _id: proId },
    { $set: { isOnCart: false } },
    { new: true }
  );
  
 await User.updateOne({_id: userId}, {$pull: {cart: {_id: cartId}}})

  res.json('item removed')
 } catch (error) {
  console.log(error);
 }
}



const updateCart = async (req, res)=>{
  try {
    const userData = req.session.user
    const data = await User.find({_id:userData._id},{_id:0, cart:1}).lean()

    data[0].cart.forEach((val,i)=>{
      val.quantity = req.body.datas[i].quantity
    })

    await User.updateOne({_id:userData._id},{$set:{cart:data[0].cart}})
    res.json('from backend ,cartUpdation json')

  } catch (error) {
    console.log(error);
  }
}








module.exports = {
  addToCart,
  loadCart, 
  removeCart,
  // cartUpdation,
  updateCart,
  
};




