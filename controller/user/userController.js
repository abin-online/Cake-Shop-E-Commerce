const User       = require('../../model/userModel')
const argon2     = require('argon2')
const userHelper = require('../../helpers/user.helper')
const Product    = require('../../model/productModel')
const Category   = require('../../model/categoryModel')
const Banners    = require('../../model/banner')
const Review     = require('../../model/review')
const Order      = require('../../model/order')
const Coupon     = require('../../model/coupon')
const { log } = require('handlebars')

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;



let otp
let userOtp
let hashedPassword
let userRegData
let otpError = ''
let isLogedin = false
let userData
let userEmail
let productSearched = false
let message2 


//To load home

const loadHome = async(req, res)=>{
   
   try {
    const loadProData = await Product.find().lean()
    const newProduct = await Product.find({is_blocked: false}).sort({_id:-1}).limit(8).lean()
    const loadCatData = await Category.find({isListed:true}).lean()
    const banners     = await Banners.find().lean()
    const popularCakes = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $unwind: "$product" },
        { $group: { _id: "$product.id", totalQuantityDelivered: { $sum: "$product.quantity" } } },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
        { $unwind: "$productDetails" },
        { $sort: { totalQuantityDelivered: -1 } },
        { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
        { $unwind: "$categoryDetails" }
      ]);
      
      
      console.log(popularCakes)

    //const coupons      = await Coupon.find().limit(6).lean()
    const userData = req.session.user
    console.log(userData)
    let coupons = await Coupon.find({status:true,
        expiryDate: { $gte: new Date() }
    }).limit(6).lean();
    
    
    if(userData){
        coupons = await Coupon.find({status:true,
            expiryDate: { $gte: new Date() },
            usedBy: { $nin: [userData._id] }
        }).limit(6).lean();

        res.render('user/home',{userData, loadProData, loadCatData, banners , coupons , newProduct , popularCakes})
    }else{

        res.render('user/home',{userData, loadProData, loadCatData, banners , coupons , newProduct , popularCakes})

    }

   





    
    
   } catch (error) {
    console.log(error);
   }
}

//All product page


const getProduct = async (req, res) => {
    let userData = false;
    if(req.session.user){

    const user = req.session.user;
    const id = user._id
    userData = await User.findById(id).lean();
    console.log(userData)

    }
    
    

    try {
        let page = 1; // Initial page is always 1 for the GET request
        const limit = 9;
        const loadCatData = await Category.find({}).lean();
        const proData = await Product.find({ is_blocked: false })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('category', 'category')
            .lean();
        const count = await Product.countDocuments({ is_blocked: false });
        const totalPages = Math.ceil(count / limit);
        const proCount = count
    
        // const user = await User.findById(userId).populate('wishlist').lean()
        // const wishItem = user.wishlist
     
    
        // for (let i of wishItem) {
        //   i.ID = userData._id
        //   productExist = await User.find({ _id: userId, "cart.product": new ObjectId(i._id) }).lean();
        //   if (productExist.length === 0) i.productExistInCart = false
        //   else i.productExistInCart = true
        // }
        // console.log(wishItem)

        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const newProduct = await Product.find({is_blocked: false}).sort({_id:-1}).limit(3).lean()
        console.log(newProduct)
        
        res.render('user/products', { userData ,
            proData,
            pages,
            currentPage: page,
            loadCatData,
            newProduct,
            currentFunction: 'getProductsPage',  
            proCount  
            
        });
    } catch (error) {
        console.log(error);
    }
};

const getProductsPage = async (req, res) => {
    const user = req.session.user;

    try {
        const page = parseInt(req.body.page); // Get the page number from the POST request
        const limit = 9;
        const proData = await Product.find({ is_blocked: false })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('category', 'category')
            .lean();
        console.log(proData)
        const count = await Product.countDocuments({ is_blocked: false });
        const newProduct = await Product.find({is_blocked: false}).sort({_id:-1}).limit(3).lean()
        console.log(newProduct)
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        
        res.json({
            proData,
            pages,
            newProduct,
            currentPage: page,
            currentFunction: 'getProductsPage'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




const aboutPage = async(req, res)=>{
    try {
        const userData = req.session.user
        



        console.log(userData)
        res.render('user/aboutPage' , {userData})
    } catch (error) {
        
    }
}

//Product details page


const ProductView = async(req, res)=>{
    try {
      const proId = req.query.id
      const proData = await Product.findById(proId).lean()
      console.log(proData )
      const userData = req.session.user

      

        
        let reviewExist = true //variable to check review exist or not
        const reviews = await Review.aggregate([
            {
              $match: {isListed: true , productId: ObjectId(proId) }
            }
            
          ]);
        console.log(reviews)

        if(reviews.length == 0){
            reviewExist = false
        }

        let userCanReview = false; //variable to check user can able to review or not

        
        let productExist  //store the user data if the product exist in the respective user's cart
        let productExistInCart //

      if(userData){

        const userId = userData._id
        console.log(userData)
        

        // query
        productExist = await User.find({ _id: userId , "cart.product": new ObjectId(proId)}).lean();

        console.log(productExist)
        if(productExist.length === 0) productExistInCart = false
        else productExistInCart = true
        console.log(productExistInCart) 

        
        // const Orders = await Order.find({userId : ObjectId(userId) , status: "Delivered"},{product:1,_id:0})

        // console.log(Orders)

        // for(let i of Orders){
            
        //     for(let j of i.product){
        //         console.log(j.name)
        //         if(j.name == proData.name){
        //             console.log("I found " , j.name)
        //             userCanReview = true
        //         }
        //     }
        // }

        
      
          const orders = await Order.aggregate([
            {
              $match: {
                userId: ObjectId(userId),
                status: "Delivered"
              }
            },
            {
              $unwind: "$product"
            },
            {
              $match: {
                "product.id": proData._id
              }
            },
            {
              $project: {
                _id: 0,
                product: 1
              }
            }
          ]);;
          console.log("Orders:", orders);
      
          
          if (orders.length > 0) {
            userCanReview = true;
            console.log("I found", orders[0].product.name);
          }

        console.log(userCanReview)

      }
      

        



      if (userData) {
        console.log(userCanReview)
        res.render('user/productview', {proData, userData ,  productExistInCart , reviews , userCanReview , reviewExist})
      }else{
        res.render('user/productview', {proData , reviews , reviewExist})    
      }
    } catch (error) {
        console.log(error);
    }
}


//user login page


const userLogin = (req, res)=>{

    let regSuccessMsg = 'User registered sucessfully..!!'
    let blockMsg      = 'Sorry something went wrong..!!'
    let mailErr       = 'Incorrect email or password..!!'
    let newpasMsg     = 'Your password reseted successfuly..!!'
    message2 = false


    if(req.session.mailErr){
        res.render('user/login', {mailErr})
        req.session.mailErr = false
    }
    else if(req.session.regSuccessMsg){
        res.render('user/login', {regSuccessMsg})
        req.session.regSuccessMsg = false
    }
    else if(req.session.userBlocked){
        res.render('user/login', {blockMsg})
        req.session.userBlocked = false
    }
    else if(req.session.LoggedIn){
        res.render('user/login')
        req.session.LoggedIn = false
    }
    else if(req.session.newPas){
        res.render('user/login', {newpasMsg})
        req.session.newPas = false
    }
    else{
        res.render('user/login')
    }
}


//user signup page

const usersignup = (req, res)=>{
    try {
        res.render('user/signup')
    } catch (error) {
        console.log(error);
    }
}

//google authentication

const googleCallback =  async (req, res) => {
    try {
      // Add the user's name to the database
      userData = await User.findOneAndUpdate(
        { email: req.user.email },
        { $set: { name: req.user.displayName,isVerified:true,isBlocked:false } },
        { upsert: true,new :true }
      );
      console.log(userData)
  
      // Set the user session
       req.session.LoggedIn = true
        req.session.user = userData
      // Redirect to the homepage
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  }

  

//To get otp page

const getOtp = (req, res)=>{
    try {
        res.render('user/submitOtp')
    } catch (error) {
        console.log(error);
    }
   }



//Submit otp and save user

const submitOtp = async (req, res) => {
    try {
        userOtp = req.body.otp;


        if (userOtp == otp) {
            const user = new User({
                name: userRegData.name,
                email: userRegData.email,
                mobile: userRegData.phone,
                password: hashedPassword,
                isVerified: true,
                isBlocked: false,
            });

            await user.save();

            req.session.regSuccessMsg = true;

            // Send JSON response with success message
            res.json({ success: true, redirectUrl: '/login' });
        } else {
            otpError = 'incorrect otp';

            // Send JSON response with error message
            res.json({ error: otpError });
        }
    } catch (error) {
        console.log(error);

        // Send JSON response with error message
        res.json({ error: 'An error occurred while submitting the OTP.' });
    }
};

//To resend otp

const resendOtp =  async (req, res)=>{
    try {
        res.redirect('/get_otp')
        otp = await userHelper.verifyEmail(userEmail)
    } catch (error) {
        console.log(error);
    }
}


//User login


const doLogin = async(req, res)=>{
    
    try {
       let email    = req.body.email
       let password = req.body.password

       userData = await User.findOne({ email: email });
       if(userData){
        console.log(userData.password)
       console.log(email)
       console.log(password)

       }
       

       if(userData){
          if (await argon2.verify(userData.password, password)){ 

                const isBlocked = userData.isBlocked

                if(!isBlocked){

                   req.session.LoggedIn = true
                   req.session.user =  userData

                   res.redirect('/')
                } else {
                   userData = null
                   req.session.userBlocked = true
                   res.redirect('/login')
                }
              }
              else {
                req.session.mailErr = true
                res.redirect('/login')
              }
            }else{
                req.session.mailErr = true
                res.redirect('/login')
            }    
     } catch (error) {
        console.log(error);
     }
}

//User logout


const doLogout = async(req,res)=>{
    try {
        req.session.destroy()
        userData = null
        // req.session.LoggedIn = false
        res.redirect('/login')

    } catch (error) {
        console.log(error.message);
    }
 }



//user signup

const doSignup = async(req, res)=>{

    try {
         hashedPassword  = await userHelper.hashPassword(req.body.password)
         userEmail       = req.body.email 
         userRegData     = req.body
        

        const userExist = await User.findOne({email: userEmail})
        if(!userExist){
              otp = await userHelper.verifyEmail(userEmail)
              res.render('user/submitOtp')
         }
        else{
            message2 = true

            res.render('user/login', {message2})
           
        }

    } catch (error) {
        console.log(error);     
    }   
}



const productSearch = async(req, res)=>{
    const { search, catId } = req.body



    if(catId){   

        try {
            const products = await Product.find({ category: catId, name: { $regex: search, $options: 'i' } })
            .populate('category', 'category');
            res.json(products);
          } catch (error) {
            console.log(error);
            return res.status(500).send();
          }
          
          
     }else{
        try {
            const products = await Product.find({ name: { $regex: search, $options: 'i' } })
            .populate('category', 'category');


            res.json(products);
          } catch (error) {
            console.log(error);
            return res.status(500).send();
          }
          
     }
    }




    const sortProductByName = async (req, res) => {
        try {
            const { sort, catId, page } = req.body;
            console.log('Sort:', sort); // Log sort order
            const limit = 9;
            const skip = (page - 1) * limit;
    
            let query = { is_blocked: false };
            if (catId) {
                query.category = catId;
            }
    
            const sortOrder = sort === 'asc' ? 1 : -1;
    
            const products = await Product.find(query)
                .sort({ name: sortOrder })
                .populate('category', 'category')
                .skip(skip)
                .limit(limit)
                .lean();
    
            const count = await Product.countDocuments(query);
            const totalPages = Math.ceil(count / limit);
            const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
            const proCount = count
            res.json({ productData: products, pages, currentPage: page, sort , count ,proCount});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };


    const sortProductByPrice = async (req, res) => {
        try {
            const { sort, catId, page } = req.body;
            console.log(sort, catId, page); // Log sort order
            const limit = 9;
            const skip = (page - 1) * limit;
    
            let query = { is_blocked: false };
            if (catId) {
                query.category = catId;
            }
    
            const products = await Product.find(query)
                .sort({ price: sort })
                .populate('category', 'category')
                .skip(skip)
                .limit(limit)
                .lean();
    
            const count = await Product.countDocuments(query);
            const totalPages = Math.ceil(count / limit);
            const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
            const proCount = count
            res.json({ productData: products, pages, currentPage: page, sort , count , proCount});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };




module.exports = {
    doLogout, 
    getProduct, 
    getProductsPage,
    loadHome ,  
    ProductView, 
    userLogin, 
    usersignup, 
    doSignup, 
    submitOtp, 
    doLogin, 
    getOtp,
    resendOtp,
    productSearch,
    sortProductByName,
    sortProductByPrice,
    googleCallback,
    aboutPage
}