const userHelper = require('../../helpers/user.helper');
const  User  = require('../../model/userModel');
const argon = require('argon2');


let otp;
let email;

/////////render forgot otp mail page

// const submitMailProfile= async(req,res)=>{
//     try {

//         const mailError='Invalid User'
//         if (req.session.mailError) {
//             res.render('user/userResetPassword/mailSubmit',{mailError})
//             req.session.mailError=false

            
//         } else {
//             res.render('user/userResetPassword/mailSubmit')
            
//         }
        
        
//     } catch (error) {
//         console.log(error)
//     }
// }

///// submit forgot password request

const submitMailPostProfile=async(req,res)=>{
    try {
        const user=req.session.user;
        const userMail=user.email
        const userData=await User.findOne({email:userMail}).lean()
        console.log(userData)
        if(userData){
            otp=await userHelper.verifyEmail(userMail)
            console.log(otp)
            res.redirect('/profileOtp')
        }else{
            req.session.mailError=true
            res.redirect('/profileOtp')
        }

        
    } catch (error) {
        console.log(error)
        
    }
}

const forgotOtppageProfile=async(req,res)=>{
    try {
        let otpErr = 'Incorrect otp..!!';

        if (req.session.otpErr) {
            console.log("OTP Error:", req.session.otpErr); // Debugging statement
            res.render('user/userResetPassword/submitOtp', { otpErr });
        } else {
            res.render('user/userResetPassword/submitOtp');
        }
    } catch (error) {
        console.log(error);
    }
}
const forgotOtpSubmitProfile=async(req,res)=>{
    let enteredOtp = req.body.otp;

    console.log("Entered OTP:", enteredOtp); // Debugging statement
    console.log("Stored OTP:", otp); // Debugging statement

    if (enteredOtp === otp) {
        res.json({ success: true, redirectUrl: '/profileResetPassword' });
        
    } else {
        req.session.otpErr = true;

        otpError = 'incorrect otp';

        // Send JSON response with error message
        res.json({ error: otpError });
        

    }
}

const resetPasswordPageProfile=async(req,res)=>{
    try {
        res.render('user/userResetPassword/resetPassword');
    } catch (error) {
        console.log(error);
    }


}
const resetPasswordProfile=async(req,res)=>{
    try {
        const user=req.session.user;
        const userMail=user.email
        const newPassword  = req.body.password
        const hashedPassword = await userHelper.hashPassword(newPassword)
        //hashedPassword = await userHelper.hashpassword(req.body.password);

        await User.updateOne({ email: userMail }, { $set: { password: hashedPassword } });
        req.session.newPas = true;
        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }

}

module.exports={
    submitMailPostProfile,
    forgotOtppageProfile,
    forgotOtpSubmitProfile,
    resetPasswordProfile,
    resetPasswordPageProfile
}