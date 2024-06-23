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
router.post('/products_filter',  userController.productSearch)




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


//profile reset password
// router.get('/profileSubmit_otp', logedin, userController.getOtp)
// router.post('/profileSubmit_otp', logedin, userController.submitOtp)
// router.get('/profileResend_otp', logedin, userController.resendOtp)
router.get('/changePassword', logedin, resetProfile.submitMailPostProfile)
router.get('/profileOtp', logedin, resetProfile.forgotOtppageProfile)
router.post('/profileOtp', logedin, resetProfile.forgotOtpSubmitProfile)
router.get('/profileResetPassword', logedin, resetProfile.resetPasswordPageProfile)
router.post('/profileResetPassword', logedin, resetProfile.resetPasswordProfile)



//cart
router.get('/cart', logedin, isBlocked, cart.loadCart)
router.get('/add_to_cart', logedin, isBlocked, cart.addToCart)
router.get('/remove', isLogin, isBlocked, cart.removeCart)
router.post('/cart_updation', logedin, isBlocked, cart.updateCart)

//checkout
router.get('/checkout', logedin, isBlocked, checkout.loadCheckout)
router.get('/check_stock', logedin, isBlocked, checkout.checkStock)
router.post('/place_order', logedin, isBlocked, checkout.placeOrder)

//orders

router.get('/my_orders', logedin, isBlocked, orders.myOrders)
router.get('/order_details', logedin, isBlocked, orders.orderDetails)
router.get('/order_sucess', logedin, isBlocked, orders.orderSuccess)
router.get('/payment_failed', logedin , isBlocked , orders.payment_failed)
router.post('/cancel_order', logedin, isBlocked, orders.cancelOrder)
router.post('/return_order', logedin, isBlocked, orders.returnOrder)

router.post('/retry_payment' ,logedin , isBlocked , orders.retryPayment)

router.get('/filter_orders', logedin, isBlocked, orders.filterOrders)

router.get('/get_invoice', logedin, isBlocked, orders.getInvoice)

router.get('/wishlist', logedin, isBlocked, wishlist.loadWishlist)
router.get('/add_to_wishlist', logedin, isBlocked, wishlist.addToWishList)
router.get('/remove_from_wishlist', logedin, isBlocked, wishlist.removeFromWishList)

//checkout
// router.post('/validate_coupon', logedin, isBlocked, checkout.validateCoupon)
router.post('/apply_coupon', logedin, isBlocked, checkout.applyCoupon);
router.post('/remove_coupon', logedin, isBlocked, checkout.removeCoupon);


router.get('/wallet', logedin, isBlocked, wallet.walletpage)
router.post('/addmoneytowallet', logedin, isBlocked, wallet.addMoneyToWallet)
router.post('/verify_Payment', logedin, isBlocked, wallet.verifyPayment)


router.post('/addReview', logedin, isBlocked, review.addNewReviewPost)
router.post('/editReview/:id', logedin, isBlocked, review.editReviewPost)



module.exports = router;
