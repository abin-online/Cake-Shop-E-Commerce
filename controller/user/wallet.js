const  User  = require('../../model/userModel')
const path = require("path");
require('dotenv').config({path: path.resolve(__dirname,".env")});
const razorpay = require("razorpay")

let instance = new razorpay({
    key_id: process.env.RAZORPAY_ID ,
    key_secret: process.env.RAZORPAY_SECRET 
})


let walletpage =async (req,res)=>{
    
    const userData = await User.findById(req.session.user._id).lean();
    try {
        // const userId = req.query.id
        let history = userData.history.sort((a,b)=>{
            return b.date - a.date
        })
        res.render('user/wallet',{userData , history , KEY_ID : process.env.RAZORPAY_ID})
        
    } catch (error) {
        
        console.log(error)
    }

}


let addMoneyToWallet = async (req, res) => {
    try {
        console.log(req.body)

        var options = {
            amount: parseInt(req.body.total) * 100,
            currency: "INR",
            receipt: "" + Date.now(),
        }
        

        instance.orders.create(options, async function (error, order) {
            if (error) {
                

            }
            else {

                var amount = order.amount / 100
                
                await User.updateOne(
                    {
                        _id: req.session.user._id
                    },
                    {
                        $push: {
                            history: {
                                amount: amount,
                                status: "credit",
                                date: Date.now()
                            }
                        }
                    }
                )

            }
            res.json({
                order: order,
                razorpay: true
            })
        })


    } catch (error) {
        
        res.status(500).send("Internal Server Error");

    }
}

const verifyPayment = async (req, res) => {
    try {
        let details = req.body
        
        
        // let amount = parseInt(details['order[order][amount]']) / 100
        var amount = parseInt((details.order.order.amount)/100)
       
        console.log(amount,'..............')
        await User.updateOne(
            {
                _id: req.session.user._id
            },
            {
                $inc: {
                    wallet: amount
                }
            }
        )
        res.json({
            success: true
        })
    } catch (error) {
        
        res.status(500).send("Internal Server Error");


    }
}


module.exports = {
    walletpage,
    addMoneyToWallet,
    verifyPayment
}
