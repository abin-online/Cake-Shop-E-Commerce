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
            Product.find().limit(8).lean(),
            Product.find({ is_blocked: false }).sort({ _id: -1 }).limit(8).lean(),
            Category.find({ isListed: true }).lean(),
            Banners.find().lean(),
            Order.aggregate([
                { $match: { status: "Delivered" } },
                { $unwind: "$product" },
                { $group: { _id: "$product.id", totalQuantityDelivered: { $sum: "$product.quantity" } } },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
                { $unwind: "$productDetails" },
                { $sort: { totalQuantityDelivered: -1 } },
                { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
                { $unwind: "$categoryDetails" },
                { $limit: 8 }
            ])
        ]);

        // Now you can work with the results
        console.log(loadProData);
        console.log(newProduct);
        console.log(loadCatData);
        console.log(banners);
        console.log(popularCakes);



        console.log(popularCakes)

        //const coupons      = await Coupon.find().limit(6).lean()
        const userData = req.session.user
        console.log(userData)
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

            res.render('user/home', { userData, loadProData, loadCatData, banners, coupons, newProduct, popularCakes })
        } else {

            res.render('user/home', { userData, loadProData, loadCatData, banners, coupons, newProduct, popularCakes })

        }

    } catch (error) {
        console.log(error);
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
        console.log(error);
    }
};



const searchSortFilter = async (req, res) => {
    const { searchQuery, sortOption, categoryFilter, page, limit } = req.body;
    console.log(req.body);

    // Construct the query object
    const query = {};
    if (searchQuery) {
        console.log('searching...');
        query.name = { $regex: searchQuery, $options: 'i' };
        console.log(query.name);
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
    console.log(products);
    console.log(totalProducts);


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
        const proId = req.query.id
        const proData = await Product.findById(proId).lean()
        console.log(proData)
        const userData = req.session.user




        let reviewExist = true //variable to check review exist or not
        const reviews = await Review.aggregate([
            {
                $match: { isListed: true, productId: ObjectId(proId) }
            }

        ]);
        console.log("Reviewsssssssss",reviews)

        if (reviews.length == 0) {
            reviewExist = false
        }

        let userCanReview = false; //variable to check user can able to review or not


        let productExist  //store the user data if the product exist in the respective user's cart
        let productExistInCart //

        let totalRating = 0
        reviews.forEach((rev)=>{
            totalRating = totalRating + rev.rating;
        })

        let avgRating = Math.round(totalRating / reviews.length)
        console.log(avgRating)

        if (userData) {

            const userId = userData._id
            console.log(userData)


            // query
            productExist = await User.find({ _id: userId, "cart.product": new ObjectId(proId) }).lean();

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
            res.render('user/productview', {avgRating , proData, userData, productExistInCart, reviews, userCanReview, reviewExist })
        } else {
            res.render('user/productview', {avgRating , proData, reviews, reviewExist })
        }
    } catch (error) {
        console.log(error);
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
        console.log(error);
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

const resendOtp = async (req, res) => {
    try {
        res.redirect('/get_otp')
        otp = await userHelper.verifyEmail(userEmail)
    } catch (error) {
        console.log(error);
    }
}




//user login controller
const doLogin = async (req, res) => {

    try {
        let email = req.body.email
        let password = req.body.password

        userData = await User.findOne({ email: email });
        if (userData) {
            console.log(userData.password)
            console.log(email)
            console.log(password)

        }


        if (userData) {
            if (await argon2.verify(userData.password, password)) {

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
        console.log(error);
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
        console.log(error.message);
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
        console.log(error);
    }
}



const productSearch = async (req, res) => {
    const { search, catId } = req.body



    if (catId) {

        try {
            const products = await Product.find({ category: catId, name: { $regex: search, $options: 'i' } })
                .populate('category', 'category');
            res.json(products);
        } catch (error) {
            console.log(error);
            return res.status(500).send();
        }


    } else {
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
    productSearch,
    searchSortFilter,
    googleCallback,
    aboutPage
}