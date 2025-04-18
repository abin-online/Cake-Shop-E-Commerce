const userHelper  = require('../../helpers/user.helper')
const User        = require('../../model/userModel')
const argon       = require('argon2')



let otp
let email




////  To get email enter page for forget password //// 

 const submitMail  = (req, res) => {
    try {
        const mailError = 'Invalid user'

        if(req.session.mailError){
            res.render('user/forgetPassword/mailSubmit', {mailError})
            req.session.mailError = false
        }else{
            res.render('user/forgetPassword/mailSubmit')
        }
    } catch (error) {
        
    }
}


/// Forget Password email post ////


 const submitMailPost = async(req, res) => {
    try {
        
        email  = req.body.email 
        const userDetails  = await User.findOne({email:email})

        if(userDetails){
            otp = await userHelper.verifyEmail(email)
            res.redirect('/otp')
            // res.render('user/forgetPassword/submitOtp')
        }else{
            req.session.mailError = true
            res.redirect('/forget_passsword')
        }     
    } catch (error) {
        console.log(error)
    }    
}


///// To get submit otp page ////


const submitOtp = (req, res) => {
    try {
        let otpErr = 'Incorrect otp..!!'

        if(req.session.otpErr){
            res.render('user/forgetPassword/submitOtp', {otpErr})
        }else{
            res.render('user/forgetPassword/submitOtp')        
        }
    } catch (error) {
        
    }
}


//// To check otp and render password reset page ////


const submitOtpPost = (req, res) => {
    let enteredOtp = req.body.otp
    
    if(enteredOtp === otp){

        res.json({ success: true, redirectUrl: '/reset_password' });
        
    }else{
        req.session.otpErr = true

        otpError = 'incorrect otp';

        // Send JSON response with error message
        res.json({ error: otpError });
       
    }
   
}


///// To get reset password page ////


const resetPassword = (req, res) => {
    try {
        res.render('user/forgetPassword/resetPassword')
    } catch (error) {
        
    }
}


// In Reset password page  ////


const resetPasswordPost = async (req, res) => {
    try {
        const newPassword  = req.body.password
        const hashedPassword = await userHelper.hashPassword(newPassword)

        await User.updateOne({email: email}, {$set:{password : hashedPassword}})
        req.session.newPas = true
        res.redirect('/login')
    } catch (error) {
        
    }
}



module.exports = {
    submitMail,
    submitMailPost,
    submitOtp, 
    submitOtpPost,
    resetPassword,
    resetPasswordPost,
}