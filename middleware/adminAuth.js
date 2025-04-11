const isLogin = async(req,res,next)=>{
    try {

        if(!req.session.admin){
            res.redirect('/admin/login')
        }
        next()
    } catch (error) {
        
    }

}


const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin/home')
        }
        next()

    } catch (error) {
        
    }

}

module.exports ={
    isLogin,
    isLogout
}