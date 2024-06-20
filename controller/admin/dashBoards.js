const moment = require('moment');
const Sale = require('../../model/order')
const Order = require('../../model/order');
const PDFDocument = require('pdfkit')
const hbs = require('hbs')
const Handlebars = require('handlebars')
const Product = require('../../model/productModel')
const Category = require('../../model/categoryModel')

let months        = []
let odersByMonth  = []
let revnueByMonth = []
let totalRevnue = 0
let totalSales  = 0




const loadDashboard = async(req, res) => {

  const bestSellings = await Order.aggregate([
    { $match: { status: "Delivered" } },
    { $unwind: "$product" },
    { $group: { _id: "$product.id", totalQuantityDelivered: { $sum: "$product.quantity" } } },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
    { $unwind: "$productDetails" },
    { $sort: { totalQuantityDelivered: -1 } },
    { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
    { $unwind: "$categoryDetails" },
    {$limit:5}
  ]);
  
  const bestSellingCategory = await Order.aggregate([
    { $match: { status: "Delivered" } },
    { $unwind: "$product" },
    { 
      $lookup: {
        from: "products",
        localField: "product.id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    { 
      $group: {
        _id: "$productDetails.category",
        totalQuantityDelivered: { $sum: "$product.quantity" }
      }
    },
    { 
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: "$categoryDetails" },
    { $sort: { totalQuantityDelivered: -1 } },
    { $limit: 5}
  ]);

  console.log(bestSellingCategory)
  
  
  

  const popularBrands = await Product.aggregate([
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
        productCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        brandId: '$_id',
        brandName: 1,
        brandImageUrl: 1,
        productCount: 1
      }
    },
    {
      $limit:5

    }
  ]);

  console.log(popularBrands)
 

       
    Sale.find({}, (err, sales) => {
      if (err) {
        console.error(err);
        return;
      }
    
      console.log(sales,'salessssssssssssssssss');
      
      const salesByMonth = {};
      
      sales.forEach((sale) => {
        const monthYear = moment(sale.date).format('MMMM YYYY');
        if (!salesByMonth[monthYear]) {
          salesByMonth[monthYear] = {
            totalOrders: 0,
            totalRevenue: 0
          };
        }
        salesByMonth[monthYear].totalOrders += 1;
        salesByMonth[monthYear].totalRevenue += sale.total;
      });
      
      const chartData = [];
      
      Object.keys(salesByMonth).forEach((monthYear) => {
        const { totalOrders, totalRevenue } = salesByMonth[monthYear];
        chartData.push({
          month: monthYear.split(' ')[0],
          totalOrders: totalOrders || 0,
          totalRevenue: totalRevenue || 0
        });
      });
      
      //console.log(chartData);
      
       months        = []
       odersByMonth  = []
       revnueByMonth = []
       totalRevnue = 0
       totalSales  = 0



      chartData.forEach((data) => {
        months.push(data.month)
        odersByMonth.push(data.totalOrders)
        revnueByMonth.push(data.totalRevenue)
        totalRevnue += Number(data.totalRevenue)
        totalSales  += Number(data.totalOrders)
      })

      const thisMonthOrder = odersByMonth[odersByMonth.length-1]
      const thisMonthSales = revnueByMonth[revnueByMonth.length-1]

      //console.log(thisMonthOrder, thisMonthSales);

     

      // console.log(months);
      // console.log(odersByMonth);
      // console.log(revnueByMonth);
      // console.log(totalRevnue);
      // console.log(totalSales);

      res.render('admin/home', { popularBrands , bestSellings  , bestSellingCategory , revnueByMonth, months, odersByMonth, totalRevnue, totalSales, thisMonthOrder, thisMonthSales , layout:'adminlayout'})

    })
    
}





 const getSales = async (req, res) => {
    console.log(req.query , "................................/")
    const { stDate, edDate } = req.query
    console.log(stDate, edDate)
    
    const startDate = new Date(stDate);
    const endDate = new Date(new Date(edDate).setHours(23, 59, 59, 999));    
    const orders = await Order.aggregate([
      { 
        $match: { 
          date: { 
            $gte: startDate, 
            $lte: endDate 
          }, 
          status: 'Delivered' 
        }
      },
      { 
        $sort: { 
          date: -1 
        }
      }
    ]);
    
    
    const formattedOrders = orders.map((order) => ({
        date: moment(order.date).format('YYYY-MM-DD'),
        ...order
    }))
    
    console.log(formattedOrders);
    
    let salesData = []
    
    formattedOrders.forEach((element) => {
        salesData.push({
            date: element.date,
            orderId: element.orderId,
            total: element.total,
            payMethod: element.paymentMethod,
            proName: element.product,
        })
    })
    
    
    let grandTotal = 0
    
    salesData.forEach(element => {
        grandTotal += element.total
    })
    
    console.log(grandTotal);
    
    res.json({
        grandTotal: grandTotal,
        orders: salesData,
    });
    

 }



 const getChartData = (req, res) => {
    try {
        res.json({
            months: months,
            revnueByMonth: revnueByMonth,
            odersByMonth : odersByMonth
        })
    } catch (error) {
        
    }
 }

 




module.exports = {
    loadDashboard,
    // currentMonthOrder,
    getSales,
    getChartData,
}