const Product = require("../../model/productModel");

const Category = require("../../model/categoryModel");
const productOffer = require("../../model/productOffer");
const categoryOffer = require("../../model/categoryOffer")
const moment = require('moment');
const HttpStatus = require('../../constants/httpStatus');





// Product Offer Page
const productOfferPage = async (req, res) => {
    try {

        let page = 1
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 3
        let productOfferData = await productOffer.find().skip((page - 1) * limit).limit(limit * 1).lean()
        const count = await productOffer.find({}).countDocuments();
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        // updating the currentStatus field by checking with the current date
        productOfferData.forEach(async (data) => {
            const isActive = data.endDate >= new Date() && data.startDate <= new Date();
            await productOffer.updateOne(
                { _id: data._id },
                {
                    $set: {
                        currentStatus: isActive

                    }
                }
            )
        })
        console.log(productOfferData)

        //sending the formatted date to the page
        productOfferData = productOfferData.map((data) => {
            data.startDate = moment(data.startDate).format("YYYY-MM-DD");
            data.endDate = moment(data.endDate).format("YYYY-MM-DD");
            return data;
        });


        console.log(productOfferData)

        res.render("admin/productOffer", { layout: "adminLayout", productOfferData, pages });
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
}


// Add Product Offer Page
const addProductOfferPage = async (req, res) => {
    try {
        const products = await Product.find({}).lean()
        res.render("admin/addProductOffer", { layout: "adminLayout", products });
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
}


// Add Product Offer

const addProductOffer = async (req, res) => {
    try {
        const { productName, productOfferPercentage, startDate, endDate } = req.body;
        console.log(req.body);

        const product = await Product.findOne({ name: productName });

        const existingOffer = await productOffer.findOne({
            productId: product._id,
            currentStatus: true
        });

        if (existingOffer) {
            return res.status(HttpStatus.BadRequest).json({ message: "Offer already exists" });
        }

        const discount = parseFloat(productOfferPercentage);

        if (isNaN(discount) || discount < 5 || discount > 90) {
            return res.status(HttpStatus.BadRequest).json({ message: "Percentage Only between 5 and 90." });
        }


        const isActive = new Date(endDate) >= new Date() && new Date(startDate) <= new Date();


        const discountPrice = product.price - (product.price * discount) / 100;


        const proOffer = new productOffer({
            productId: product._id,
            productName: productName,
            productOfferPercentage: discount,
            discountPrice: discountPrice,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            currentStatus: isActive
        });

        await proOffer.save();
        console.log("Product offer saved:", proOffer);


        //await product.save();

        return res.status(HttpStatus.OK).json({ message: "Product offer added successfully!" });

    } catch (error) {
        console.error('Error adding productOffer:', error.message);
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
};



// Edit Product Page
const editProductOfferPage = async (req, res) => {
    try {
        const { id } = req.params
        const editProductOfferData = await productOffer.findById(id).lean()
        const products = await Product.find().lean();
        let startDate = moment(editProductOfferData.startDate).format('YYYY-MM-DD');
        let endDate = moment(editProductOfferData.endDate).format('YYYY-MM-DD');
        res.render("admin/editProductOffer", { layout: "adminLayout", editProductOfferData, startDate, endDate, products })

    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
}


// Edit Product Offer
const editProductOffer = async (req, res) => {
    try {
        const { offerId, productName, productOfferPercentage, startDate, endDate } = req.body;


        const productOfferData = await productOffer.findById(offerId);

        const product = await Product.findOne({ name: productName });

        const discount = parseFloat(productOfferPercentage);

        if (isNaN(discount) || discount < 5 || discount > 90) {
            return res.status(HttpStatus.BadRequest).json({ message: "Percentage only between 5 and 90." });
        }

        // Check for any other active product offer for the same product, excluding the current one
        const existingActiveOffer = await productOffer.findOne({
            productId: product._id,
            _id: { $ne: offerId }, // Exclude the current offer being edited
            currentStatus: true
        });

        if (existingActiveOffer) {
            return res.status(HttpStatus.BadRequest).json({ message: "Offer already exists for this product." });
        }


        const isActive = new Date(endDate) >= new Date() && new Date(startDate) <= new Date();


        const discountPrice = product.price - (product.price * discount) / 100;


        productOfferData.productName = productName;
        productOfferData.productOfferPercentage = discount;
        productOfferData.discountPrice = discountPrice;
        productOfferData.startDate = new Date(startDate);
        productOfferData.endDate = new Date(endDate);
        productOfferData.currentStatus = isActive;

        await productOfferData.save();

        return res.status(HttpStatus.OK).json({ message: "Product offer updated successfully" });

    } catch (error) {
        console.error("Error editing product offer:", error.message);
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
};




// Delete Product Offer
const deleteProductOffer = async (req, res) => {
    try {
        const { id } = req.params;

        await productOffer.findByIdAndDelete(id);

        res.status(HttpStatus.OK).send("Product offer deleted successfully.");
    } catch (error) {
        console.error(error.message);
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
};


// Category Offer Page
const categoryOfferPage = async (req, res) => {
    try {
        var page = 1
        if (req.query.page) {
            page = req.query.page
        }
        let limit = 2
        let categoryOffers = await categoryOffer.find().skip((page - 1) * limit).limit(limit * 1).lean()
        const count = await categoryOffer.find({}).countDocuments();
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        categoryOffers.forEach(async (data) => {
            const isActive = data.endDate >= new Date() && data.startDate <= new Date();
            await categoryOffer.updateOne(
                { _id: data._id },
                {
                    $set: {
                        currentStatus: isActive

                    }
                }
            )
        })


        categoryOffers = categoryOffers.map((data) => {
            data.startDate = moment(data.startDate).format('YYYY-MM-DD');
            data.endDate = moment(data.endDate).format('YYYY-MM-DD')
            return data
        })

        res.render("admin/categoryOffer", { layout: "adminLayout", categoryOffers, pages });
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
}



// Add Category Offer Page
const addCategoryOfferPage = async (req, res) => {
    try {
        const category = await Category.find({}).lean()
        res.render("admin/addCategoryOffer", { layout: "adminLayout", category });
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
}



// Add Category Offer
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryName, categoryOfferPercentage, categoryOfferStartDate, categoryOfferEndDate } = req.body;
        console.log(req.body)
        const category = await Category.findOne({ category: categoryName });

        const existingOffer = await categoryOffer.findOne({
            categoryId: category._id,
            currentStatus: true
        });

        if (existingOffer) {
            return res.status(HttpStatus.BadRequest).json({ message: "Offer already exists" });
        }

        const discount = parseFloat(categoryOfferPercentage);

        if (isNaN(discount) || discount < 5 || discount > 90) {
            return res.status(HttpStatus.BadRequest).json({ message: "Percentage only between 5 and 90." });
        }

        const catOffer = new categoryOffer({
            categoryName,
            categoryId: category._id,
            categoryOfferPercentage: discount,
            startDate: new Date(categoryOfferStartDate),
            endDate: new Date(categoryOfferEndDate),
            currentStatus: new Date(categoryOfferEndDate) >= new Date() && new Date(categoryOfferStartDate) <= new Date()
        });


        await catOffer.save();
        console.log("Category Offer saved:", catOffer);

        // Fetch all products in this category
        const productsInCategory = await Product.find({ category: category._id });

        for (const product of productsInCategory) {

            const existingProductOffer = await productOffer.findOne({ productId: product._id });

            if (existingProductOffer) {

                existingProductOffer.productOfferPercentage = discount;
                existingProductOffer.discountPrice = product.price - (product.price * discount) / 100;
                existingProductOffer.startDate = new Date(categoryOfferStartDate);
                existingProductOffer.endDate = new Date(categoryOfferEndDate);

                existingProductOffer.currentStatus =
                    new Date(categoryOfferEndDate) >= new Date() &&
                    new Date(categoryOfferStartDate) <= new Date();

                await existingProductOffer.save();
            } else {
                // Create a new product offer if none exists
                const newProductOffer = new productOffer({
                    productId: product._id,
                    productName: product.name,
                    productOfferPercentage: discount,
                    discountPrice: product.price - (product.price * discount) / 100,
                    startDate: new Date(categoryOfferStartDate),
                    endDate: new Date(categoryOfferEndDate),
                    currentStatus:
                        new Date(categoryOfferEndDate) >= new Date() &&
                        new Date(categoryOfferStartDate) <= new Date()
                });

                await newProductOffer.save();
            }

        }

        res.status(HttpStatus.OK).json({
            message: "Category offer added successfully!"
        });
        

    } catch (error) {
        console.error("Error adding category offer:", error.message);
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
};




// Edit Category Offer Page
const editCategoryOfferPage = async (req, res) => {
    try {
        const { id } = req.params
        const editCategoryOfferData = await categoryOffer.findById(id).lean()

        const category = await Category.find().lean();
        console.log(editCategoryOfferData)

        let startDate = moment(editCategoryOfferData.startDate).format('YYYY-MM-DD');
        let endDate = moment(editCategoryOfferData.endDate).format('YYYY-MM-DD');

        res.render("admin/editCategoryOffer", { layout: "adminLayout", editCategoryOfferData, startDate, endDate, category })

    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
}



const editCategoryOffer = async (req, res) => {
    try {

        const { id } = req.params;
        const { categoryName, categoryOfferPercentage, categoryOfferStartDate, categoryOfferEndDate } = req.body;
        const discount = parseFloat(categoryOfferPercentage);

        if (isNaN(discount) || discount < 5 || discount > 90) {
            return res.status(HttpStatus.BadRequest).json({ message: "Percentage only between 5 and 90." });
        }

        const catOffer = await categoryOffer.findById(id);

        const category = await Category.findOne({ category: categoryName });

        catOffer.categoryName = categoryName;
        catOffer.categoryOfferPercentage = discount;
        catOffer.startDate = new Date(categoryOfferStartDate);
        catOffer.endDate = new Date(categoryOfferEndDate);
        catOffer.currentStatus =
            new Date(categoryOfferEndDate) >= new Date() && new Date(categoryOfferStartDate) <= new Date();
        await catOffer.save();
        console.log("Category Offer Updated:", catOffer);

        const productsInCategory = await Product.find({ category: category._id });

        for (const product of productsInCategory) {

            const existingProductOffer = await productOffer.findOne({ productId: product._id });

            if (existingProductOffer) {

                existingProductOffer.productOfferPercentage = discount;
                existingProductOffer.discountPrice = product.price - (product.price * discount) / 100;
                existingProductOffer.startDate = new Date(categoryOfferStartDate);
                existingProductOffer.endDate = new Date(categoryOfferEndDate);

                existingProductOffer.currentStatus =
                    new Date(categoryOfferEndDate) >= new Date() &&
                    new Date(categoryOfferStartDate) <= new Date();

                await existingProductOffer.save();

            } else {

                const newProductOffer = new productOffer({
                    productId: product._id,
                    productName: product.name,
                    productOfferPercentage: discount,
                    discountPrice: product.price - (product.price * discount) / 100,
                    startDate: new Date(categoryOfferStartDate),
                    endDate: new Date(categoryOfferEndDate),
                    currentStatus:
                        new Date(categoryOfferEndDate) >= new Date() &&
                        new Date(categoryOfferStartDate) <= new Date()
                });

                await newProductOffer.save();
            }

        }

        return res.status(HttpStatus.OK).json({ message: "Category offer Updated successfully!" });

    } catch (error) {
        console.error("Error editing category offer:", error.message);
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }
};





// Delete Category Offer
const deleteCategoryOffer = async (req, res) => {
    try {
        const { id } = req.params
        await categoryOffer.findByIdAndDelete(id)
        res.status(HttpStatus.OK).send("Category offer deleted successfully.");

    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.InternalServerError).send("Internal Server Error");
    }

}



module.exports = {
    productOfferPage,
    addProductOfferPage,
    addProductOffer,
    editProductOfferPage,
    editProductOffer,
    deleteProductOffer,
    categoryOfferPage,
    addCategoryOfferPage,
    addCategoryOffer,
    editCategoryOfferPage,
    editCategoryOffer,
    deleteCategoryOffer
}