const { body } = require('express-validator/check')
const jwt = require('jsonwebtoken');
//user validation------------------------------------------------
const validateRegistrationBody = () => {
    return [ 
        body('first_name')
        .exists()
        .withMessage('First name field is required')
        .isLength({min:1})
        .withMessage('First name must be greater than 3 letters'),
        body('last_name')
        .exists()
        .withMessage('Last name field is required')
        .isLength({min:1})
        .withMessage('Last name must be greater than 3 letters'),
        body('username')
        .exists()
        .withMessage('Username field is required')
        .isLength({min:3})
        .withMessage('Username must be greater than 3 letters'),
         body('password')
        .exists()
        .withMessage('Password field is required')
        .isLength({min : 6,max: 12})
        .withMessage('Password must be in between 6 to 12 characters long'),        
        body('email')
        .exists()
        .withMessage('Email field is required')
        .isLength({min:3})
        .withMessage('Email must be greater than 3 letters'),
        body('mobile')
        .exists()
        .withMessage('Mobile field is required')
        .isLength({min:10})
        .withMessage('Mobile must be 10 digit'),       
        body('device_id')
        .exists()
        .withMessage('Device Id field is required')
        .isLength({min:3})
        .withMessage('Device Id must be greater than 3 letters')       
       ] 
}


const validateProfileUpdateBody = () => {
    
    return [ 
        body('first_name')
        .exists()
        .withMessage('First name field is required')
        .isLength({min:1})
        .withMessage('First name must be greater than 3 letters'),
        body('last_name')
        .exists()
        .withMessage('Last name field is required')
        .isLength({min:1})
        .withMessage('Last name must be greater than 3 letters'),
        body('username')
        .exists()
        .withMessage('Username field is required')
        .isLength({min:3})
        .withMessage('Username must be greater than 3 letters'),                
        body('email')
        .exists()
        .withMessage('Email field is required')
        .isLength({min:3})
        .withMessage('Email must be greater than 3 letters'),
        body('mobile')
        .exists()
        .withMessage('Mobile field is required')
        .isLength({min:10})
        .withMessage('Mobile must be 10 digit'),       
        body('device_id')
        .exists()
        .withMessage('Device Id field is required')
        .isLength({min:3})
        .withMessage('Device Id must be greater than 3 letters')       
       ] 
}

const validateEmailConfirmBody = () => {
    return [ 
        body('email')
        .exists()
        .withMessage('email field is required')
        .isLength({min:3})
        .withMessage('email must be greater than 3 letters'),
        body('otp')
        .exists()
        .withMessage('otp field is required')
        .isLength({min:3})
        .withMessage('otp must be greater than 3 letters')
       ] 
} 
const validateUserUpdateBody = () => {
    return [ 
        body('firstName')
        .exists()
        .withMessage('firstName field is required')
        .isLength({min:1})
        .withMessage('firstName must be greater than 3 letters'),
        body('lastName')
        .exists()
        .withMessage('lastName field is required')
        .isLength({min:1})
        .withMessage('lastName must be greater than 3 letters'),
        body('city')
        .exists()
        .withMessage('city field is required')
        .isLength({min:1})
        .withMessage('city must be greater than 3 letters'),
        body('userName')
        .exists()
        .withMessage('userName field is required')
        .isLength({min:1})
        .withMessage('userName must be greater than 3 letters')
       ] 
} 

const validateLoginBody = () => {

    return [ 
        body('email').exists()
        .withMessage('Email field is required'),
        body('password')
        .exists()
        .withMessage('Password field is required')
        .isLength({min : 6,max: 12})
        .withMessage('Password must be in between 6 to 12 characters long'),
        body('device_id').exists()
        .withMessage('Device ID field is required'),
        body('latitude').exists()
        .withMessage('Latitude field is required'),
        body('longitude').exists()
        .withMessage('Longitude field is required')
       
    ] 
}

const validateForgotpasswordBody = () => {
    return [ 
        body('email').exists()
        .withMessage('email field is required')
    ] 
} 


const validatechangepassBody = () => {
    return [ 
        body('password')
        .exists()
        .withMessage('password field is required')
        .isLength({min : 8,max: 12})
        .withMessage('password must be in between 8 to 12 characters long'),
        body('currentPassword')
        .exists()
        .withMessage('currentPassword field is required')
        .isLength({min : 8,max: 12})
        .withMessage('currentPassword must be in between 8 to 12 characters long')
    ] 
} 

const validateUserAddAddressBody = () => {
    return [ 
        body('address')
        .exists()
        .withMessage('address field is required')
        .isLength({min : 3})
        .withMessage('address field is required'),
        body('houseNo')
        .exists()
        .withMessage('houseNo field is required')
        .isLength({min : 1})
        .withMessage('houseNo field is required'),
        body('landmark')
        .exists()
        .withMessage('landmark field is required')
        .isLength({min : 1})
        .withMessage('landmark field is required'),
        body('lat')
        .exists()
        .withMessage('lat field is required')
        .isLength({min : 3})
        .withMessage('lat field is required'),
        body('long')
        .exists()
        .withMessage('long field is required')
        .isLength({min : 3})
        .withMessage('long field is required'),
        body('saveAs')
        .exists()
        .withMessage('saveAs field is required')
        .isLength({min : 3})
        .withMessage('saveAs field is required')
       ] 
} 

const validateUserEditAddressBody = () => {
    return [ 
        body('addressId')
        .exists()
        .withMessage('addressId field is required')
        .isLength({min : 3})
        .withMessage('addressId field is required'),
        body('address')
        .exists()
        .withMessage('address field is required')
        .isLength({min : 3})
        .withMessage('address field is required'),
        body('houseNo')
        .exists()
        .withMessage('houseNo field is required')
        .isLength({min : 1})
        .withMessage('houseNo field is required'),
        body('landmark')
        .exists()
        .withMessage('landmark field is required')
        .isLength({min : 1})
        .withMessage('landmark field is required'),
        body('lat')
        .exists()
        .withMessage('lat field is required')
        .isLength({min : 3})
        .withMessage('lat field is required'),
        body('long')
        .exists()
        .withMessage('long field is required')
        .isLength({min : 3})
        .withMessage('long field is required'),
        body('saveAs')
        .exists()
        .withMessage('saveAs field is required')
        .isLength({min : 3})
        .withMessage('saveAs field is required')
       ] 
} 
const validateapplycouponBody = () => {
    return [ 
        body('restaurantId')
        .exists()
        .withMessage('restaurantId field is required')
        .isLength({min : 3})
        .withMessage('restaurantId field is required'),
        body('couponCode')
        .exists()
        .withMessage('couponCode field is required')
        .isLength({min : 3})
        .withMessage('couponCode field is required'),
        body('totalAmount')
        .exists()
        .withMessage('totalAmount field is required')
        .isLength({min : 1})
        .withMessage('totalAmount field is required')
       ] 
}
const validateDeliveryChargesBody = () => {
    return [ 
        body('lat')
        .exists()
        .withMessage('lat field is required')
        .isLength({min : 2})
        .withMessage('lat field is required'),
        body('long')
        .exists()
        .withMessage('long field is required')
        .isLength({min : 2})
        .withMessage('long field is required'),
        body('totalAmount')
        .exists()
        .withMessage('totalAmount field is required')
        .isLength({min : 1})
        .withMessage('totalAmount field is required')
       ] 
}
const validatePlaceOrder = () => {
    return [ 
        body('restaurantId')
        .exists()
        .withMessage('restaurantId field is required')
        .isLength({min : 2})
        .withMessage('restaurantId field is required'),
        body('addressId')
        .exists()
        .withMessage('addressId field is required')
        .isLength({min : 2})
        .withMessage('addressId field is required'),
        body('paymentMethod')
        .exists()
        .withMessage('paymentMethod field is required')
        .isLength({min : 1})
        .withMessage('paymentMethod field is required'),
        body('distance')
        .exists()
        .withMessage('distance field is required')
        .isLength({min : 1})
        .withMessage('distance field is required'),
        body('couponCode')
        .exists()
        .withMessage('couponCode field is required')
        .isLength({min : 1})
        .withMessage('couponCode field is required'),
        body('couponApply')
        .exists()
        .withMessage('couponApply field is required')
        .isLength({min : 1})
        .withMessage('couponApply field is required')
       ] 
}
const validateUserAddAmountBody = () => {
    return [ 
        body('amount')
        .exists()
        .withMessage('amount field is required')
        .isLength({min : 1})
        .withMessage('amount field is required')
       ] 
}
const validateFindCabBody = () => {
    return [           
        body('latitude')
        .exists()
        .withMessage('Latitude field is required')
        .isLength({min : 1})
        .withMessage('Latitude field is required'),
        body('longitude')
        .exists()
        .withMessage('Longitude field is required')
        .isLength({min : 1})
        .withMessage('Longitude field is required')
    ] 
}

const validateRequestCabBody = () => {
    return [
        body('driver_id')
        .exists()
        .withMessage('Driver ID field is required'),  
        body('user_id')
        .exists()
        .withMessage('User ID field is required'),  
        body('latitude')
        .exists()
        .withMessage('User Latitude field is required')
        .isLength({min : 1})
        .withMessage('User Latitude field is required'),
        body('longitude')
        .exists()
        .withMessage('User Longitude field is required')
        .isLength({min : 1})
        .withMessage('User Longitude field is required'),
         body('destination_latitude')
        .exists()
        .withMessage('Destination Latitude field is required')
        .isLength({min : 1})
        .withMessage('Destination Latitude field is required'),
        body('destination_longitude')
        .exists()
        .withMessage('Destination Longitude field is required')
        .isLength({min : 1})
        .withMessage('Destination Longitude field is required')
    ] 
}

const authClientToken = async (req,res,next) => {
    //console.log(req.headers);
   let token = req.headers['x-access-token'];
   if (!token){
       return res.status(403).json({
           "errors" : [{
               "msg" : " No token provided"
           }]
       });
   }    

   jwt.verify(token,'restapisecret', (err,decoded) => {
       if(err){
           return res.status(403).json({
               "errors" : [{
                   "msg" : "Invalid Token"
               }]
           });
       }
       
       return next();
   });
}

const authUser = () => {
    return [ 
        body('user_id')
        .exists()
        .withMessage('User ID field is required')
        .isLength({min : 1})
        .withMessage('User ID field is required')     
       ] 
}

module.exports = {
    authClientToken : authClientToken,
    authUser : authUser,
    validatechangepassBody: validatechangepassBody,
    validateForgotpasswordBody:validateForgotpasswordBody,
    validateLoginBody:validateLoginBody,
    validateRegistrationBody:validateRegistrationBody,
    validateEmailConfirmBody:validateEmailConfirmBody,
    validateUserAddAddressBody:validateUserAddAddressBody,
    validateUserEditAddressBody:validateUserEditAddressBody,
    validateUserUpdateBody:validateUserUpdateBody,
    validateapplycouponBody:validateapplycouponBody,
    validateDeliveryChargesBody:validateDeliveryChargesBody,
    validatePlaceOrder:validatePlaceOrder,
    validateUserAddAmountBody:validateUserAddAmountBody,    
    validateProfileUpdateBody:validateProfileUpdateBody,
    validateFindCabBody:validateFindCabBody,
    validateRequestCabBody:validateRequestCabBody,
    validateRequestCabBody:validateRequestCabBody
}
 
