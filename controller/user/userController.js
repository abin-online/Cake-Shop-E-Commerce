const User = require('../../model/userModel')
const argon2 = require('argon2')
const userHelper = require('../../helpers/user.helper')
const Product = require('../../model/productModel')
const Category = require('../../model/categoryModel')
const Banners = require('../../model/banner')
const Review = require('../../model/review')
const Order = require('../../model/order')
const Coupon = require('../../model/coupon')
const { log } = require('handlebars')

const mongoose = require('mongoose');
const Cart = require('../../model/cart')
const ObjectId = mongoose.Types.ObjectId;



let otp
let userOtp
let hashedPassword
let userRegData
let otpError = ''
let userData
let userEmail
let message2


//To load home

const loadHome = async (req, res) => {

    try {
        // Using Promise.all to fetch data concurrently
        const [
            loadProData,
            newProduct,
            loadCatData,
            banners,
            popularCakes
        ] = await Promise.all([
            Product.aggregate([
                { $lookup: { from: "productoffers", localField: "_id", foreignField: "productId", as: "offer" } },
                { $unwind: { path: "$offer", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "categoryDetails" } },
                { $unwind: "$categoryDetails" },
                { $limit: 8 }
            ]),
            Product.aggregate([
                { $lookup: { from: "productoffers", localField: "_id", foreignField: "productId", as: "offer" } },
                { $unwind: { path: "$offer", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "categoryDetails" } },
                { $unwind: "$categoryDetails" },
                { $limit: 8 },
                { $sort: { _id: -1 } }
            ]),
            Category.find({ isListed: true }).lean(),
            Banners.find({ active: true }).lean(),
            Order.aggregate([
                { $match: { status: "Delivered" } },
                { $unwind: "$product" },
                { $group: { _id: "$product.id", totalQuantityDelivered: { $sum: "$product.quantity" } } },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
                { $unwind: "$productDetails" },
                { $sort: { totalQuantityDelivered: -1 } },
                { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
                { $unwind: "$categoryDetails" },
                { $lookup: { from: "productoffers", localField: "productDetails._id", foreignField: "productId", as: "offer" } },
                { $unwind: { path: "$offer", preserveNullAndEmptyArrays: true } },
                { $limit: 8 }
            ])
        ]);


        const userData = req.session.user
        let coupons = await Coupon.find({
            status: true,
            expiryDate: { $gte: new Date() }
        }).limit(6).lean();


        if (userData) {
            coupons = await Coupon.find({
                status: true,
                expiryDate: { $gte: new Date() },
                usedBy: { $nin: [userData._id] }
            }).limit(6).lean();
            //console.log(banners)
            res.render('user/home', { userData, loadProData, loadCatData, banners, coupons, newProduct, popularCakes })
        } else {
            //console.log(banners)
            res.render('user/home', { userData, loadProData, loadCatData, banners, coupons, newProduct, popularCakes })

        }

    } catch (error) {
        
    }
}

//All product page


const getProduct = async (req, res) => {
    let userData = false;
    if (req.session.user) {

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

        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        const newProduct = await Product.find({ is_blocked: false }).sort({ _id: -1 }).limit(3).lean()
        console.log(newProduct)

        res.render('user/products', {
            userData,
            proData,
            pages,
            currentPage: page,
            loadCatData,
            newProduct,
            currentFunction: 'getProductsPage',
            proCount

        });
    } catch (error) {
        
    }
};



const searchSortFilter = async (req, res) => {
    const { searchQuery, sortOption, categoryFilter, page, limit } = req.body;
    

    // Construct the query object
    const query = {};
    if (searchQuery) {
        
        query.name = { $regex: searchQuery, $options: 'i' };
        
    }
    if (categoryFilter) {
        query.category = new mongoose.Types.ObjectId(categoryFilter);
    }

    // Construct the sort object
    const sort = {};
    switch (sortOption) {
        case 'priceAsc':
            sort.price = 1;
            break;
        case 'priceDesc':
            sort.price = -1;
            break;
        case 'nameAsc':
            sort.name = 1;
            break;
        case 'nameDesc':
            sort.name = -1;
            break;
        case 'newArrivals':
            sort.createdAt = -1;
            break;
        case 'popularity':
            sort.popularity = -1; // Assuming there's a popularity field
            break;
        default:
            sort.createdAt = -1; // Default sort by new arrivals
    }

    // Perform the query with pagination and sorting
    const [products, totalProducts] = await Promise.all([
        Product.find(query)
            .populate('category')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product.countDocuments(query)
    ]);

    // Now you can work with products and totalProducts
    // 
    // 


    res.json({ products, totalProducts });
};


const aboutPage = async (req, res) => {
    try {
        const userData = req.session.user

        console.log(userData)
        res.render('user/aboutPage', { userData })
    } catch (error) {

    }
}

//Product details page


const ProductView = async (req, res) => {
    try {
        console.log(req.url)
        let reviewed
        const proId = req.query.id
        console.log(proId)
        const products = await Product.aggregate([
            { $match: { _id: new ObjectId(proId) } },
            {
                $lookup: {
                    from: "productoffers",
                    localField: "_id",
                    foreignField: "productId",
                    as: "productOffer",
                },
            },
            {
                $unwind: {
                    path: "$productOffer",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        console.log("agregated product ", products)
        const proData = products[0];
        console.log(proData)
        if (!proData.productOffer) {
            proData.productOffer = {}
        }
        const userData = req.session.user
        let reviewExist = true //variable to check review exist or not
        const reviews = await Review.aggregate([
            {
                $match: { isListed: true, productId: ObjectId(proId) }
            }

        ]);
        console.log("Reviewsssssssss", reviews)

        if (reviews.length == 0) {
            reviewExist = false
        }

        let userCanReview = false; //variable to check user can able to review or not


        let productExist  //store the user data if the product exist in the respective user's cart
        let productExistInCart //

        let totalRating = 0
        reviews.forEach((rev) => {
            totalRating = totalRating + rev.rating;
        })

        let avgRating = Math.round(totalRating / reviews.length)
        console.log(avgRating)

        if (userData) {

            const userId = userData._id
            console.log(userData)


            // query
            productExist = await Cart.find({
                userId: userId,
                product_Id: proId
            })

            console.log(productExist)
            if (productExist.length === 0) productExistInCart = false
            else productExistInCart = true
            console.log(productExistInCart)



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
            ]);
            

            reviewed = await Review.find({
                userId: userData._id,
                productId: new ObjectId(proId)
            })

            console.log("..................", reviewed)


            if (orders.length > 0 && reviewed.length != 1) {
                userCanReview = true;
                // 
            }

            console.log(userCanReview)

        }



        if (userData) {
            console.log(userCanReview)
            res.render('user/productview', { avgRating, proData, userData, productExistInCart, reviews, userCanReview, reviewExist, reviewed })
        } else {
            res.render('user/productview', { avgRating, proData, reviews, reviewExist })
        }
    } catch (error) {
        
    }
}


//user login page


const userLogin = (req, res) => {

    let regSuccessMsg = 'User registered sucessfully..!!'
    let blockMsg = 'Sorry something went wrong..!!'
    let mailErr = 'Incorrect email or password..!!'
    let newpasMsg = 'Your password reseted successfuly..!!'
    message2 = false


    if (req.session.mailErr) {
        res.render('user/login', { mailErr })
        req.session.mailErr = false
    }
    else if (req.session.regSuccessMsg) {
        res.render('user/login', { regSuccessMsg })
        req.session.regSuccessMsg = false
    }
    else if (req.session.userBlocked) {
        res.render('user/login', { blockMsg })
        req.session.userBlocked = false
    }
    else if (req.session.LoggedIn) {
        res.render('user/login')
        req.session.LoggedIn = false
    }
    else if (req.session.newPas) {
        res.render('user/login', { newpasMsg })
        req.session.newPas = false
    }
    else {
        res.render('user/login')
    }
}


//user signup page

const usersignup = (req, res) => {
    try {
        res.render('user/signup')
    } catch (error) {
        
    }
}

//google authentication

const googleCallback = async (req, res) => {
    try {
        // Add the user's name to the database
        userData = await User.findOneAndUpdate(
            { email: req.user.email },
            { $set: { name: req.user.displayName, isVerified: true, isBlocked: false } },
            { upsert: true, new: true }
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

const getOtp = (req, res) => {
    try {
        res.render('user/submitOtp')
    } catch (error) {
        
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
        

        // Send JSON response with error message
        res.json({ error: 'An error occurred while submitting the OTP.' });
    }
};

//To resend otp

const resendOtp = async (req, res) => {
    try {
        res.redirect('/get_otp')
        otp = await userHelper.verifyEmail(userEmail)
    } catch (error) {
        
    }
}




//user login controller
const doLogin = async (req, res) => {

    try {
        let email = req.body.email
        let password = req.body.password

        userData = await User.findOne({ email: email });
        console.log(userData)
        if (userData) {
            console.log(userData.password)
            console.log(email)
            console.log(password)

        }


        if (userData) {
            let argonVerification = false;
            argonVerification = await argon2.verify(userData.password, password)
            console.log(argonVerification)
            if (argonVerification) {

                const isBlocked = userData.isBlocked

                if (!isBlocked) {

                    req.session.LoggedIn = true
                    req.session.user = userData

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
        } else {
            req.session.mailErr = true
            res.redirect('/login')
        }
    } catch (error) {
        
    }
}

//User logout


const doLogout = async (req, res) => {
    try {
        req.session.destroy()
        userData = null
        // req.session.LoggedIn = false
        res.redirect('/login')

    } catch (error) {
        
    }
}



//user signup

const doSignup = async (req, res) => {

    try {
        hashedPassword = await userHelper.hashPassword(req.body.password)
        userEmail = req.body.email
        userRegData = req.body


        const userExist = await User.findOne({ email: userEmail })
        if (!userExist) {
            otp = await userHelper.verifyEmail(userEmail)
            res.render('user/submitOtp')
        }
        else {
            message2 = true

            res.render('user/login', { message2 })

        }

    } catch (error) {
        
    }
}















module.exports = {
    doLogout,
    getProduct,

    loadHome,
    ProductView,
    userLogin,
    usersignup,
    doSignup,
    submitOtp,
    doLogin,
    getOtp,
    resendOtp,
    searchSortFilter,
    googleCallback,
    aboutPage
}