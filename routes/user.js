const express = require('express');
const router = express.Router();
const auth = require('../middleware/userAuth')
const userController = require('../controller/user/userController')
const forgetPassword = require('../controller/user/forgetPassword')
const profile = require('../controller/user/profile')
const cart = require('../controller/user/cart')
const checkout = require('../controller/user/checkout')
const orders = require('../controller/user/orders')
const wishlist = require('../controller/user/wishlist');
const resetProfile = require('../controller/user/resetProfilePassword')
const wallet = require('../controller/user/wallet')
require('../middleware/googleAuth')
const passport = require('passport');
const review = require('../controller/user/review');





const { isLogin, isLogout, blockCheck: isBlocked, logedin } = auth



//google authentication

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.googleCallback)





router.get('/', userController.loadHome)
router.post('/', userController.doLogin)


/////// shop
router.get('/product', userController.getProduct)
router.post('/search',userController.searchSortFilter)
router.get('/productview', userController.ProductView)




router.get('/about' , userController.aboutPage)


router.get('/login', isLogout, userController.userLogin)

router.get('/logout', userController.doLogout)
router.get('/signup', isLogout, userController.usersignup)
router.post('/signup', userController.doSignup)

router.get('/get_otp', isLogout, userController.getOtp)
router.post('/submit_otp', userController.submitOtp)

router.get('/resend_otp', isLogout, userController.resendOtp)

router.get('/profile', logedin, isBlocked, profile.loadProfile)
router.get('/adresses', logedin, isBlocked, profile.manageAddress)
router.get('/add_new_adress', logedin, isBlocked, profile.addNewAddress)
router.post('/add_new_adress', logedin, isBlocked, profile.addNewAddressPost)
router.get('/edit_address/:id', logedin, isBlocked, profile.editAddress)
router.post('/edit_address/:id', logedin, isBlocked, profile.editAddressPost)
router.get('/edit_details', logedin, isBlocked, profile.editDetails)
router.post('/update_details/:id', logedin, isBlocked, profile.updateDetails)
router.get('/delete_address/:id', logedin, isBlocked, profile.deleteAddress)

// forgot password
router.get('/forget_passsword', isLogout, forgetPassword.submitMail)
router.post('/forget_password', forgetPassword.submitMailPost)


router.get('/otp', isLogout, forgetPassword.submitOtp)
router.post('/otp', forgetPassword.submitOtpPost)

router.get('/reset_password', isLogout, forgetPassword.resetPassword)
router.post('/reset_password', forgetPassword.resetPasswordPost)



router.get('/changePassword', logedin, resetProfile.submitMailPostProfile)
router.get('/profileOtp', logedin, resetProfile.forgotOtppageProfile)
router.post('/profileOtp', logedin, resetProfile.forgotOtpSubmitProfile)
router.get('/profileResetPassword', logedin, resetProfile.resetPasswordPageProfile)
router.post('/profileResetPassword', logedin, resetProfile.resetPasswordProfile)


//cart

router.get('/cart', logedin, isBlocked, cart.loadCartPage)
router.post('/addtocart/:id', logedin, isBlocked, cart.addToCart)
router.post('/removeFromCart', logedin, isBlocked, cart.removeFromCart)
router.post('/updatecart', logedin, isBlocked, cart.updateCart)
router.post('/checkOutOfStock', logedin, isBlocked, cart.checkOutOfStock);


// Checkout Page

router.get('/cart/checkout', logedin, isBlocked, checkout.loadCheckoutPage)
router.post('/placeOrder', logedin, isBlocked, checkout.placeorder)
router.get('/orderPlaced', logedin, isBlocked, checkout.orderSuccess)
router.get('/payment_failed', logedin , isBlocked , orders.payment_failed)

router.post('/validate_coupon', logedin, isBlocked, checkout.validateCoupon)
router.post('/apply_coupon',logedin, isBlocked, checkout.applyCoupon)
router.post('/remove_coupon', logedin, isBlocked, checkout.removeCoupon)

//orders

router.get('/my_orders', logedin, isBlocked, orders.myOrders)
router.get('/order_details', logedin, isBlocked, orders.orderDetails)
router.get('/order_sucess', logedin, isBlocked, orders.orderSuccess)
router.get('/payment_failed', logedin , isBlocked , orders.payment_failed)



router.put('/cancel-order/:id', logedin, isBlocked, orders.cancelOrder);

router.put('/return-order/:id', logedin, isBlocked, orders.returnOrder);

router.put('/cancel-one-product', logedin, isBlocked, orders.cancelOneProduct);

router.put('/return-one-product', logedin, isBlocked, orders.returnOneProduct);





router.post('/retry-payment/:id' ,logedin , isBlocked , orders.retryPayment)

router.get('/filter_orders', logedin, isBlocked, orders.filterOrders)

router.get('/get_invoice', logedin, isBlocked, orders.getInvoice)

router.get('/wishlist', logedin, isBlocked, wishlist.showWishlistPage)
router.post('/addtowishlist', logedin, isBlocked, wishlist.addToWishList)
router.post('/removeFromWishList', logedin, isBlocked, wishlist.removeFromWishList)




router.get('/wallet', logedin, isBlocked, wallet.walletpage)
router.post('/addmoneytowallet', logedin, isBlocked, wallet.addMoneyToWallet)
router.post('/verify_Payment', logedin, isBlocked, wallet.verifyPayment)


router.post('/addReview', logedin, isBlocked, review.addNewReviewPost)
router.post('/editReview/:id', logedin, isBlocked, review.editReviewPost)



module.exports = router;
