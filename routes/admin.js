const express = require('express');
const router = express.Router();
const { isLogin } = require('../middleware/adminAuth')
const adminController = require('../controller/admin/adminController')
const store = require('../middleware/multer')
const dashBoards = require('../controller/admin/dashBoards')


const { productOfferPage, addProductOfferPage, editProductOfferPage, editProductOffer, deleteProductOffer, categoryOfferPage, addCategoryOfferPage, addCategoryOffer, editCategoryOfferPage, editCategoryOffer, deleteCategoryOffer, addProductOffer } = require('../controller/admin/offerManagement')



router.get('/login', adminController.adminLogin)
router.post('/login', adminController.adminDoLogin)

router.get('/logout', adminController.adminLogout)

router.get('/home', isLogin, dashBoards.loadDashboard)

router.get('/manage_users', isLogin, adminController.loadUsersData)

router.get('/block_user/:id', isLogin, adminController.blockUser)


router.post('/toggle_coupon', isLogin, adminController.listCoupon)
router.post('/toggle_review', isLogin, adminController.listReview)

router.post('/toggle_banner', isLogin, adminController.listBanner)


router.get('/category', isLogin, adminController.getCategory)
router.get('/add_category', isLogin, adminController.addCategory)
router.post('/add_category', isLogin, store.single('image'), adminController.addNewCategory)

router.post('/delete_category', isLogin, adminController.deleteCategory)
router.get('/edit_category/:id', isLogin, adminController.editCategory)
router.post('/update_category/:id', isLogin, store.single('image'), adminController.updateCategory)

router.get('/product', isLogin, adminController.getProduct)

router.get('/new_product', isLogin, adminController.newProduct)
router.post('/add_new_product', store.array('image', 5), adminController.addNewProduct)

router.post('/block_product', isLogin, adminController.blockProduct)
router.get('/delete_product/:id', isLogin, adminController.deleteProduct)
router.get('/edit_product/:id', store.array('image', 5), isLogin, adminController.editProduct)
router.post('/update_product/:id', store.array('image', 5), isLogin, adminController.updateProduct)


//delete method

router.delete('/product_img_delete', adminController.deleteProdImage)

router.get('/add_coupon', adminController.addCoupon)
router.get('/coupons', adminController.loadCoupon)
router.post('/add_coupon', adminController.addCouponPost)
// router.get('/delete_cpn', adminController.deleteCoupon)


router.get('/orders', isLogin, adminController.getOrders)
router.get('/order_details', isLogin, adminController.orderDetails)

router.post('/change_status', adminController.changeOrderStatus)

router.get('/banners', adminController.loadBanner)
router.get('/add_banner', adminController.addBanner)
router.post('/add_banner', store.single('image'), adminController.addBannerPost)
router.get('/delete_banner', adminController.deleteBanner)

router.get('/edit_banner/:id', adminController.editBanner)

// router.get('/sales_report', dashBoards.currentMonthOrder)
router.get('/get_sales', dashBoards.getSales)
router.get('/get_chart_data', dashBoards.getChartData)

router.get('/reviews', adminController.loadReviews)

// coupons

router.get('/brands', adminController.loadBrands)
router.get('/brands', isLogin, adminController.getCategory)
router.get('/add_brands', isLogin, adminController.addBrandPage)
router.post('/add_brands', isLogin, store.single('image'), adminController.addNewBrand)

router.post('/delete_brands', isLogin, adminController.deleteBrand)
router.get('/edit_brands/:id', isLogin, adminController.editBrandPage)
router.post('/update_brands/:id', isLogin, store.single('image'), adminController.updateBrand)

//offers


router.get('/productOffers', isLogin, productOfferPage)
router.get('/addProOffers', isLogin, addProductOfferPage)
router.post('/addProOffers', isLogin, addProductOffer)
router.get('/editProductOffer/:id', isLogin, editProductOfferPage)
router.post("/editProductOffer/:id", isLogin, editProductOffer);
router.delete('/deleteProOffer/:id', isLogin, deleteProductOffer)

router.get('/categoryOffers', isLogin, categoryOfferPage)
router.get('/addCatOffers', isLogin, addCategoryOfferPage)
router.post('/addCatOffers', isLogin, addCategoryOffer)
router.get('/editCategoryOffer/:id', isLogin, editCategoryOfferPage)
router.post("/editCategoryOffer/:id", isLogin, editCategoryOffer);
router.delete('/deleteCatOffer/:id', isLogin, deleteCategoryOffer)


module.exports = router;
