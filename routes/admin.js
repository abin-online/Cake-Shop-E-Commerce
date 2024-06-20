const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth')
const adminController = require('../controller/admin/adminController')
const store = require('../middleware/multer')
const dashBoards = require('../controller/admin/dashBoards')






router.get('/login', adminController.adminLogin)
router.post('/login', adminController.adminDoLogin)

router.get('/logout', adminController.adminLogout)

router.get('/home', adminAuth.isLogin, dashBoards.loadDashboard)

router.get('/manage_users', adminAuth.isLogin, adminController.loadUsersData)

router.get('/block_user/:id', adminAuth.isLogin, adminController.blockUser)


router.post('/toggle_coupon', adminAuth.isLogin, adminController.listCoupon)
router.post('/toggle_review', adminAuth.isLogin, adminController.listReview)

router.post('/toggle_banner' , adminAuth.isLogin, adminController.listBanner)


router.get('/category', adminAuth.isLogin, adminController.getCategory)
router.get('/add_category', adminAuth.isLogin, adminController.addCategory)
router.post('/add_category', adminAuth.isLogin, store.single('image'), adminController.addNewCategory)

router.post('/delete_category', adminAuth.isLogin, adminController.deleteCategory)
router.get('/edit_category/:id', adminAuth.isLogin, adminController.editCategory)
router.post('/update_category/:id', adminAuth.isLogin, store.single('image'), adminController.updateCategory)

router.get('/product', adminAuth.isLogin, adminController.getProduct)

router.get('/new_product', adminAuth.isLogin, adminController.newProduct)
router.post('/add_new_product', store.array('image', 5), adminController.addNewProduct)

router.post('/block_product', adminAuth.isLogin, adminController.blockProduct)
router.get('/delete_product/:id', adminAuth.isLogin, adminController.deleteProduct)
router.get('/edit_product/:id', store.array('image', 5), adminAuth.isLogin, adminController.editProduct)
router.post('/update_product/:id', store.array('image', 5), adminAuth.isLogin, adminController.updateProduct)


//delete method

router.delete('/product_img_delete', adminController.deleteProdImage)

router.get('/add_coupon', adminController.addCoupon)
router.get('/coupons', adminController.loadCoupon)
router.post('/add_coupon', adminController.addCouponPost)
// router.get('/delete_cpn', adminController.deleteCoupon)


router.get('/orders', adminAuth.isLogin, adminController.getOrders)
router.get('/order_details', adminAuth.isLogin, adminController.orderDetails)

router.post('/change_status', adminController.changeOrderStatus)

router.get('/banners', adminController.loadBanner)
router.get('/add_banner', adminController.addBanner)
router.post('/add_banner', store.single('image'), adminController.addBannerPost)
router.get('/delete_banner', adminController.deleteBanner)

router.get('/edit_banner/:id' , adminController.editBanner)

// router.get('/sales_report', dashBoards.currentMonthOrder)
router.get('/get_sales', dashBoards.getSales)
router.get('/get_chart_data', dashBoards.getChartData)

router.get('/reviews' , adminController.loadReviews)

// coupons

router.get('/brands' , adminController.loadBrands)
router.get('/brands', adminAuth.isLogin, adminController.getCategory)
router.get('/add_brands', adminAuth.isLogin, adminController.addBrandPage)
router.post('/add_brands', adminAuth.isLogin, store.single('image'), adminController.addNewBrand)

router.post('/delete_brands', adminAuth.isLogin, adminController.deleteBrand)
router.get('/edit_brands/:id', adminAuth.isLogin, adminController.editBrandPage)
router.post('/update_brands/:id', adminAuth.isLogin, store.single('image'), adminController.updateBrand)




module.exports = router;
