const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const Coupon = require("../../model/coupon");
const Orders = require("../../model/order");
const Address = require("../../model/address");
const Banner = require('../../model/banner');
const Reviews = require('../../model/review')
const Brand = require('../../model/brandModel')
const moment = require("moment");
const mongoose = require('mongoose');
const HttpStatus = require("../../constants/httpStatus");


let adminData
let catSaveMsg = "Category added suceessfully..!!";

///Admin home page ///

const adminLogin = (req, res) => {
  res.render("admin/login", { layout: 'loginlayout' });
};

/////Admin Login//////

const adminDoLogin = async (req, res) => {
  try {
    adminData = {


      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    };
    let adminEmail = req.body.email;
    let adminPassword = req.body.password;


    //adminData = await Admin.findOne({ email: adminEmail });

    if (adminData) {
      if (adminPassword === adminData.password && adminEmail === adminData.email) {
        req.session.aLoggedIn = true;
        req.session.admin = adminData;
        res.redirect("/admin/home");
      } else {
        res.render("admin/login", { message: "incorrect email or password", layout: 'loginlayout' });
      }
    } else {
      res.render("admin/login", { message: "incorrect email or password", layout: 'loginlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};

///Admin logout ////////////////

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    adminData = null
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};


///Get home page////////////


const loadHome = (req, res) => {
  try {
    res.render("admin/home", { layout: 'adminlayout' });
  } catch (error) {
    console.log(error);
  }
};


//Get all users data///////////////

const loadUsersData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const searchQuery = req.query.search || '';
    const statusFilter = req.query.status;

    const query = {};

    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search
    }

    if (statusFilter === 'Active') {
      query.isBlocked = false;
    } else if (statusFilter === 'Disabled') {
      query.isBlocked = true;
    }

    const allUsersData = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const count = await User.countDocuments(query);
    const totalPages = Math.ceil(count / limit);

    // Pagination Logic with Dots
    const pageNumbers = [];
    if (totalPages <= 5) {
      pageNumbers.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      if (page > 2) pageNumbers.push(1);
      if (page > 3) pageNumbers.push('...');
      if (page > 1) pageNumbers.push(page - 1);

      pageNumbers.push(page);

      if (page < totalPages) pageNumbers.push(page + 1);
      if (page < totalPages - 2) pageNumbers.push('...');
      if (page !== totalPages) pageNumbers.push(totalPages);
    }

    res.render("admin/manage_users", {
      allUsersData,
      pageNumbers,
      currentPage: page,
      searchQuery,
      statusFilter,
      layout: 'adminlayout'
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const blockUser = async (req, res) => {
  try {
    let id = req.params.id;

    const blockUser = await User.findById(id);
    let isBlocked = blockUser.isBlocked;

    const usrData = await User.findByIdAndUpdate(
      id,
      { $set: { isBlocked: !isBlocked } },
      { new: true }
    );

    res.redirect("/admin/manage_users");
  } catch (error) {
    console.log(error);
  }
};

/// To get category page ///

const getCategory = async (req, res) => {
  try {
    var page = 1
    if (req.query.page) {
      page = req.query.page
    }
    const limit = 3;
    let allCtegoryData = await Category.find()
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .lean();
    const count = await Category.find({}).count();
    const totalPages = Math.ceil(count / limit)
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    let catUpdtMsg = "Category updated successfully..!!";

    if (req.session.categoryUpdate) {
      res.render("admin/category", { allCtegoryData, pages, currentPage: page, catUpdtMsg, layout: 'adminlayout' });
      req.session.categoryUpdate = false;
    } else {
      res.render("admin/category", { allCtegoryData, pages, currentPage: page, layout: 'adminlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};

/// To get add category page ///

const addCategory = (req, res) => {
  try {
    let catExistMsg = "Category alredy Exist..!!";

    if (req.session.categorySave) {
      res.render("admin/add_category", { catSaveMsg, layout: 'adminlayout' });
      req.session.categorySave = false;
    } else if (req.session.catExist) {
      res.render("admin/add_category", { catExistMsg, layout: 'adminlayout' });
      req.session.catExist = false;
    } else {
      res.render("admin/add_category", { layout: 'adminlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};

/// To add new category post///

const addNewCategory = async (req, res) => {
  const catName = req.body.name;
  const image = req.file;
  const lCatName = catName;

  try {
    const catExist = await Category.findOne({ category: { $regex: new RegExp("^" + lCatName + "$", "i") } });
    if (!catExist) {
      const category = new Category({
        category: lCatName,
        imageUrl: image.filename,
      });

      await category.save();
      req.session.categorySave = true;
      res.redirect("/admin/add_category");
    } else {
      req.session.catExist = true;
      res.redirect("/admin/add_category");
    }
  } catch (error) { }
};

/// To edit category ///

const editCategory = async (req, res) => {
  let catId = req.params.id;

  try {
    const catData = await Category.findById({ _id: catId }).lean();

    if (req.session.catExist) {
      res.render("admin/edit_category", { catData, catExistMsg, layout: 'adminlayout' });
      // req.session.catExist = false
    } else {
      res.render("admin/edit_category", { catData, layout: 'adminlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};



const updateCategory = async (req, res) => {
  try {
    const catName = req.body.name;
    const image = req.file;
    const catId = req.params.id;

    const cat = await Category.findById(catId);
    const catImg = cat.imageUrl;
    let updImge;

    if (image) {
      updImge = image.filename;
    } else {
      updImge = catImg;
    }


    const catExist = await Category.findOne({ category: { $regex: new RegExp("^" + catName + "$", "i") } });

    if (!catExist) {
      await Category.findByIdAndUpdate(
        catId,
        {
          category: req.body.name,
          imageUrl: updImge,
        },
        { new: true }
      );

      req.session.categoryUpdate = true;
      res.redirect("/admin/category");
    } else {
      // req.session.catExist = true
      res.redirect("/admin/category");
    }
  } catch (error) { }
};



const deleteCategory = async (req, res) => {
  try {
    const id = req.body.id
    // const catId = req.params.id
    let user = await Category.findById(id)
    let newListed = user.isListed

    await Category.findByIdAndUpdate(id, {
      isListed: !newListed
    },
      { new: true })

    res.redirect('/admin/category')



  } catch (error) {
    console.log(error)

  }
}







// load product ///////////

const getProduct = async (req, res) => {
  try {
    var page = 1
    if (req.query.page) {
      page = req.query.page
    }
    const limit = 10;
    const productData = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit * 1
      }
    ]);

    const count = await Product.find({}).count();
    console.log(count)

    // console.log(products);
    const totalPages = Math.ceil(count / limit)  // Example value
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    res.render("admin/products", { productData, pages, currentPage: page, layout: 'adminlayout' });
  } catch (error) {
    console.log(error);
  }
};

////// new Product page/////////////


const newProduct = async (req, res) => {
  try {
    let productSaveMsg = "Product added successfuly..!!";

    const catogories = await Category.aggregate([
      {
        $match: {
          isListed: true
        }
      }
    ]);

    console.log(catogories);

    const brandData = await Brand.aggregate([
      {
        $match: {
          isListed: true
        }
      }
    ])
    console.log(brandData);

    console.log(catogories)
    if (req.session.productSave) {
      res.render("admin/addproduct", { brandData, productSaveMsg, catogories, layout: 'adminlayout' });
      req.session.productSave = false;
    } else {
      res.render("admin/addproduct", { brandData, catogories, layout: 'adminlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};




const getOrders = async (req, res) => {
  try {
    const PAGE_SIZE = 5;
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const totalOrders = await Orders.countDocuments();
    const totalPages = Math.ceil(totalOrders / PAGE_SIZE);
    const safePage = Math.min(page, totalPages);

    const skip = (safePage - 1) * PAGE_SIZE;

    const orders = await Orders.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(PAGE_SIZE);

    const ordersData = orders.map((order) => ({
      ...order.toObject(),
      date: moment(order.date).format("MMMM D, YYYY")
    }));

    // Pagination Logic - No Duplicate Pages
    const pageNumbers = [];
    if (totalPages <= 5) {
      pageNumbers.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      if (safePage > 2) pageNumbers.push(1); // Add 1 only once if current page > 2
      if (safePage > 3) pageNumbers.push('...');
      if (safePage > 1) pageNumbers.push(safePage - 1);

      pageNumbers.push(safePage);

      if (safePage < totalPages) pageNumbers.push(safePage + 1);
      if (safePage < totalPages - 2) pageNumbers.push('...');
      if (safePage !== totalPages) pageNumbers.push(totalPages); // Only add totalPages if it's not already included
    }

    res.render("admin/orders", {
      ordersData,
      currentPage: safePage,
      pageNumbers,
      totalPages,
      layout: 'adminlayout'
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(HttpStatus.InternalServerError).send("Internal Server Error");
  }
};






////// Add new Product post/////////////

const addNewProduct = async (req, res) => {
  try {
    const files = req.files;
    const images = [];

    files.forEach((file) => {
      const image = file.filename;
      images.push(image);
    });
    const { name, price, description, category, stock, brand } = req.body;
    const product = new Product({
      name: name,
      price: price,
      description: description,
      category: category,
      brand: brand,
      stock: stock,
      imageUrl: images,
      isWishlisted: false
    });

    await product.save();
    req.session.productSave = true;
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};

/// To edit Product ///

const editProduct = async (req, res) => {
  try {
    let proId = req.params.id;

    const proData = await Product.findById({ _id: proId }).lean()
    const catogories = await Category.find({ isListed: true }).lean()
    const brandData = await Brand.find({ isListed: true }).lean()

    console.log(".........................................................oo", proData);
    console.log(catogories);


    res.render("admin/edit_product", { brandData, proData, catogories, layout: 'adminlayout' })
  } catch (error) {
    console.log(error);
  }
};

/// To update Product post///

const updateProduct = async (req, res) => {
  try {
    const proId = req.params.id;
    const product = await Product.findById(proId);
    const exImage = product.imageUrl;
    const files = req.files;
    let updImages = [];

    if (files && files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updImages = [...exImage, ...newImages];
      product.imageUrl = updImages;
    } else {
      updImages = exImage;
    }

    const { name, price, description, category, stock, brand } = req.body;
    await Product.findByIdAndUpdate(
      proId,
      {
        name: name,
        price: price,
        description: description,
        category: category,
        stock: stock,
        is_blocked: false,
        brand: brand,

        imageUrl: updImages,
      },
      { new: true }
    );

    // req.session.productSave = true
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};

/// To delete Product ///

const deleteProduct = async (req, res) => {
  const proId = req.params.id;
  await Product.findByIdAndDelete(proId)
  res.redirect('/admin/product')
  // const prodData = await Product.findById(proId);
  // const isBlocked = prodData.is_blocked;

  // const proData = await Product.findByIdAndUpdate(
  //   proId,
  //   { $set: { is_blocked: !isBlocked } },
  //   { new: true }
  // );

  // res.redirect("/admin/product");
  // req.session.proDelete = true;
};

const blockProduct = async (req, res) => {
  const id = req.body.id
  // const proId = req.params.id;
  const prodData = await Product.findById(id);
  const isBlocked = prodData.is_blocked;

  const proData = await Product.findByIdAndUpdate(
    id,
    { $set: { is_blocked: !isBlocked } },
    { new: true }
  );

  res.redirect("/admin/product");
  req.session.proDelete = true;
};

const loadCoupon = async (req, res) => {
  try {
    var page = 1
    if (req.query.page) {
      page = req.query.page
    }
    const limit = 5;
    let coupon = await Coupon.find()
      .skip((page - 1) * limit)
      .limit(limit * 1)
    const count = await Coupon.find({}).count();
    const totalPages = Math.ceil(count / limit)
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    console.log(coupon)


    const now = moment();

    const couponData = coupon.map((cpn) => {
      const formattedDate = moment(cpn.expiryDate).format("MMMM D, YYYY");

      return {
        ...cpn,
        expiryDate: formattedDate,
      };
    });
    console.log(couponData, "copondAtaaaaaaaaaaa")
    res.render("admin/coupon", { couponData, pages, currentPage: page, layout: 'adminlayout' });
  } catch (error) {
    console.log(error);
  }
};

const addCoupon = (req, res) => {
  try {
    const couponMsg = "Coupon added successfuly..!!";
    const couponExMsg = "Coupon alredy exist..!!";

    if (req.session.coupon) {
      res.render("admin/add_coupon", { couponMsg, layout: 'adminlayout' });
      req.session.coupon = false;
    } else if (req.session.exCoupon) {
      res.render("admin/add_coupon", { couponExMsg, layout: 'adminlayout' });
      req.session.exCoupon = false;
    } else {
      res.render("admin/add_coupon", { layout: 'adminlayout' });
    }

  } catch (error) {
    console.log(error);
  }
};

const addCouponPost = async (req, res) => {
  try {
    const { code, percent, expDate, max } = req.body;

    const cpnExist = await Coupon.findOne({ code: code });

    if (!cpnExist) {
      const coupon = new Coupon({
        code: code,
        discount: percent,
        expiryDate: expDate,
        maxDiscountAmount: max
      });

      await coupon.save();
      req.session.coupon = true;
      res.redirect("/admin/coupons");

    } else {
      req.session.exCoupon = true;
      res.redirect("/admin/add_coupon");
    }
  } catch (error) {
    console.log(error);
  }
};

// Adjust the path as necessary

// for coupon block 

const listCoupon = async (req, res) => {
  try {
    const id = req.body.id
    // const catId = req.params.id
    let coupon = await Coupon.findById(id)
    console.log(coupon)
    let newListed = coupon.status
    console.log(newListed)
    await Coupon.findByIdAndUpdate(id, {
      status: !newListed
    },
      { new: true })
    res.redirect('/admin/coupons')


  } catch (error) {
    console.log(error)

  }
}
//for review block
const listReview = async (req, res) => {
  try {
    const id = req.body.id
    // const catId = req.params.id
    let review = await Reviews.findById(id)
    console.log(review)
    let newListed = review.isListed
    console.log(newListed)
    await Reviews.findByIdAndUpdate(id, {
      isListed: !newListed
    },
      { new: true })
    res.redirect('/admin/reviews')


  } catch (error) {
    console.log(error)

  }
}

//for banner block
const listBanner = async (req, res) => {
  try {
    const { id } = req.body;
    const banner = await Banner.findById(id);
    
   

    console.log(id, banner);

    const newStatus = banner.active; // Ensure 'active' is the correct field
    const updatedBanner = await Banner.findByIdAndUpdate(
      id, 
      { active: !newStatus }, 
      { new: true } // Ensure it returns the updated document
    );

    console.log(updatedBanner);
    
    return res.status(200).json({ message: "Banner updated", banner: updatedBanner }); // 🚨 Always return after sending response
  } catch (error) {
    console.error(error);
    //return res.status(500).json({ message: "Internal Server Error" }); // 🚨 Ensure return here too
  }
};



const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;

    await Coupon.findByIdAndDelete(id);

    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error);
  }
};

const orderDetails = async (req, res) => {
  try {
    const userData = req.session.user;
    const orderId = req.query.id;

    const myOrderDetails = await Orders.findById(orderId).lean();
    const orderedProDet = myOrderDetails.product;
    const addressId = myOrderDetails.address;
    console.log(orderedProDet)
    const address = await Address.findById(addressId).lean();

    res.render("admin/order_Details", {
      myOrderDetails,
      orderedProDet,
      userData,
      address,
      layout: 'adminlayout'
    });
  } catch (error) {
    console.log(error);
  }
};

const changeOrderStatus = async (req, res) => {
  console.log(req.body);

  try {
    const id = req.query.id;
    const status = req.body.status;
    console.log(status)
    const order = await Orders.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true }
    );
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error);
  }
};



const deleteProdImage = async (req, res) => {
  try {

    const { id, image } = req.query
    const product = await Product.findById(id);

    product.imageUrl.splice(image, 1);

    await product.save();

    res.status(200).send({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

const loadBanner = async (req, res) => {
  try {
    const PAGE_SIZE = 3;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * PAGE_SIZE;

    const banners = await Banner.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE).lean();

    const totalBanners = await Banner.countDocuments();
    const totalPages = Math.ceil(totalBanners / PAGE_SIZE);

    // Pagination Logic
    let pageNumbers = [];
    if (totalPages <= 5) {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (page <= 3) {
        pageNumbers = [1, 2, 3, '...', totalPages];
      } else if (page >= totalPages - 2) {
        pageNumbers = [1, '...', totalPages - 2, totalPages - 1, totalPages];
      } else {
        pageNumbers = [1, '...', page - 1, page, page + 1, '...', totalPages];
      }
    }

    console.log(banners)
    res.render('admin/banners', {
      banners,
      totalPages,
      currentPage: page,
      pageNumbers,
      layout: 'adminlayout'
    });

  } catch (error) {
    console.error("Error loading banners:", error);
    res.status(500).send("Internal Server Error");
  }
};



const addBanner = (req, res) => {
  try {

    res.render('admin/add_banner', { layout: 'adminlayout' })
  } catch (error) {
    console.log(error);
  }
}


const addBannerPost = async (req, res) => {
  try {
    const { line1, line2, line3, line4 } = req.body
    const image = req.file.filename

    const banner = new Banner({
      line1: line1,
      line2: line2,
      line3: line3,
      line4: line4,
      image: image,
    })

    await banner.save()
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error)
  }
}


const editBanner = async (req, res) => {
  try {
    const id = req.params.id
    const bannerData = await Banner.findById({ _id: id }).lean()

    res.render("admin/editBanner", { bannerData, layout: 'adminlayout' })

  } catch (error) {

  }
}


const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id;

    await Coupon.findByIdAndDelete(id);

    res.redirect("/admin/banners");
  } catch (error) {
    console.log(error);
  }
};





const loadReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 5; // Number of reviews per page
    const skip = (page - 1) * limit; // Skip reviews based on the current page

    const reviews = await Reviews.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      { $skip: skip }, // Pagination logic
      { $limit: limit } // Number of records per page
    ]);

    const totalReviews = await Reviews.countDocuments(); // Total number of reviews
    const totalPages = Math.ceil(totalReviews / limit);

    res.render('admin/reviews', {
      reviews,
      layout: 'adminlayout',
      currentPage: page,
      totalPages
    });

  } catch (error) {
    console.error("Error loading reviews:", error);
    res.status(HttpStatus.InternalServerError).send("Internal Server Error");
  }
};


const loadBrands = async (req, res) => {
  try {

    const brandData = await Product.aggregate([
      { $match: { is_blocked: false } },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brandDetails'
        }
      },
      { $unwind: '$brandDetails' },
      {
        $group: {
          _id: '$brandDetails._id',
          brandName: { $first: '$brandDetails.brand' },
          brandImageUrl: { $first: '$brandDetails.imageUrl' },
          isListed: { $first: '$brandDetails.isListed' },
          productCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          brandId: '$_id',
          brandName: 1,
          brandImageUrl: 1,
          productCount: 1,
          isListed: 1
        }
      }
    ])

    console.log(brandData);



    res.render('admin/brands', { brandData, layout: 'adminlayout' })

  } catch (error) {

  }
}




/// To get add brand page ///

const addBrandPage = (req, res) => {
  try {
    let brandExistMsg = "Brand already exists..!!";

    if (req.session.brandSave) {
      res.render("admin/add_brand", { brandSaveMsg: "Brand saved successfully!", layout: 'adminlayout' });
      req.session.brandSave = false;
    } else if (req.session.brandExist) {
      res.render("admin/add_brand", { brandExistMsg, layout: 'adminlayout' });
      req.session.brandExist = false;
    } else {
      res.render("admin/add_brand", { layout: 'adminlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};


/// To add new brand post///
const addNewBrand = async (req, res) => {
  const brandName = req.body.name;
  const image = req.file;
  const lBrandName = brandName;

  try {
    const brandExist = await Brand.findOne({ brand: { $regex: new RegExp("^" + lBrandName + "$", "i") } });
    if (!brandExist) {
      const brand = new Brand({
        brand: lBrandName,
        imageUrl: image.filename,
      });

      await brand.save();
      req.session.brandSave = true;
      res.redirect("/admin/add_brands");
    } else {
      req.session.brandExist = true;
      res.redirect("/admin/add_brands");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/admin/add_brands");
  }
};

/// To edit brand ///

const editBrandPage = async (req, res) => {
  let brandId = req.params.id;

  try {
    const brandData = await Brand.findById({ _id: brandId }).lean();
    let brandExistMsg = "Brand already exists..!!";
    console.log(brandData)
    if (req.session.brandExist) {
      res.render("admin/edit_brand", { brandData, brandExistMsg, layout: 'adminlayout' });
      req.session.brandExist = false;
    } else {
      res.render("admin/edit_brand", { brandData, layout: 'adminlayout' });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandName = req.body.name;
    const image = req.file;
    const brandId = req.params.id;

    const brand = await Brand.findById(brandId);
    const brandImg = brand.imageUrl;
    let updImg;

    if (image) {
      updImg = image.filename;
    } else {
      updImg = brandImg;
    }

    const brandExist = await Brand.findOne({ brand: { $regex: new RegExp("^" + brandName + "$", "i") }, _id: { $ne: brandId } });

    if (!brandExist) {
      await Brand.findByIdAndUpdate(
        brandId,
        {
          brand: req.body.name,
          imageUrl: updImg
        },
        { new: true }
      );

      req.session.brandUpdate = true;
      res.redirect("/admin/brands");
    } else {
      req.session.brandExist = true;
      res.redirect("/admin/brands");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/admin/brands");
  }
};


const deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;

    let brand = await Brand.findById(id);
    console.log(brand)
    let newListed = brand.isListed;

    await Brand.findByIdAndUpdate(
      id,
      {
        isListed: !newListed
      },
      { new: true }
    );
    res.redirect('/admin/brands');
  } catch (error) {
    console.log(error);
    res.redirect('/admin/brands');
  }
};





module.exports = {
  adminLogin,
  adminDoLogin,
  loadHome,
  adminLogout,
  blockUser,
  loadUsersData,

  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  addNewCategory,
  updateCategory,

  getProduct,
  addNewProduct,
  newProduct,
  editProduct,
  deleteProduct,
  blockProduct,
  updateProduct,
  deleteProdImage,

  getOrders,
  orderDetails,

  loadCoupon,
  addCoupon,
  addCouponPost,
  deleteCoupon,

  changeOrderStatus,

  loadBanner,
  addBanner,
  addBannerPost,
  editBanner,
  deleteBanner,
  listCoupon,
  listReview,


  loadReviews,
  loadBrands,
  addBrandPage,
  addNewBrand,
  editBrandPage,
  updateBrand,
  deleteBrand,
  listBanner

};
