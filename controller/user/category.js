const Product  = require('../../model/productModel')
const Category = require('../../model/categoryModel')

const catFilter = async (req, res) => {
    try {
        const { catId, page } = req.body;
        console.log(page);
        const limit = 9;
        const skip = (page - 1) * limit;

        let query = { is_blocked: false };
        if (catId) {
            query.category = catId;
        }

        const products = await Product.find(query)
            .populate('category', 'category')
            .skip(skip)
            .limit(limit)
            .lean();

        const count = await Product.countDocuments(query);
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.json({ productData: products, pages, currentPage: page, catId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const categoryFilter = async(req, res)=>{
    try {
        const id       = req.query.id
        const catData  = await Category.find().lean()
        const productData = await Product.find({ category: id, is_blocked:false }).lean()
        const newProduct = await Product.find({}).sort({_id:1}).lean()
        res.render( 'user/category', {productData, catData , newProduct})
    } catch (error) {
        console.log(error);
    }   
}



const loadWomCat = async(req, res)=>{
    try {
        id = req.query.id   

        const womenData = await Product.find({category: id, is_blocked:false})
        if (req.session.user) {
            res.render('user/women_cat',{womenData, userData})
        }else{
            res.render('user/women_cat',{womenData})
        }
    } catch (error) {
        console.log(error);
    }   
}





module.exports = {
    catFilter,
    loadWomCat,
    categoryFilter,

}