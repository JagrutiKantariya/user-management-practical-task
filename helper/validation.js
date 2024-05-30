const { BAD_REQUEST } = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;
const Joi = require('joi');
const userModel = require('../models/user.model');

const uniqueEmail = async (value, _id = null) => {
    try {
        var query = { email: value }
        if (_id) {
            query = { _id: { $ne: new ObjectId(_id) }, ...query }
        }
        const userExist = await userModel.findOne(query);
        if (userExist) {
            return { status: false, message: 'Email is already in use' };
        }
        return { status: true };

    } catch (error) {
        console.log(19,{error})
        return { status: false, message: 'Internal server error' };
    }
};
const uniqueMobileNumber = async (value, _id = null) => {
    try {

        var query = { mobileNumber: value }
        if (_id) {
            query = { _id: { $ne: new ObjectId(_id) }, ...query }
        }
        const userExist = await userModel.findOne(query);
        if (userExist) {
            return { status: false, message: 'Mobile number is already in use' };
        }
        return { status: true };

    } catch (error) {
        console.log(37,{error})

        return { status: false, message: 'Internal server error' };
    }
};
const userAddressValidationObject ={
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().optional(),
    pincode: Joi.number().required().min(1111).max(999999),
    city: Joi.string().required(),
    state: Joi.string().required(),
    addressType : Joi.string().required()
}

const addressValidationSchema = Joi.object(userAddressValidationObject);

const userValidationObject={
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(), // Assuming 10-digit number
    birthDate: Joi.date().iso().optional(),
    address: Joi.array().items(addressValidationSchema).min(1)//.required() // Assuming ISO format date string (YYYY-MM-DD)
}

// Validate the input while create user data
const validateCreateUser = async(req,res,next) => {

    const userValidationSchema = Joi.object(userValidationObject);

    const {error,value } = await userValidationSchema.validate(req?.body);
    if(error){
        return res.status(BAD_REQUEST).json({
        status:false,
        message:error?.details?.[0]?.message
        })
    }else{
        const emailValidation = await uniqueEmail(req?.body?.email);
        if (!emailValidation.status) {
            return res.status(BAD_REQUEST).json({
                status: false,
                message: emailValidation.message
            });
        }
        const mobileValidation = await uniqueMobileNumber(req?.body?.mobileNumber);
        if (!mobileValidation.status) {
            return res.status(BAD_REQUEST).json({
                status: false,
                message: mobileValidation.message
            });
        }
        if(emailValidation?.status && mobileValidation?.status ){
            next()
        }
        
        
    }
};
// // Validate the input while update user data
const validateUpdateUser = async(req,res,next) => {
    userAddressValidationObject._id =  Joi.string().optional().trim()
    const addressValidationSchema = Joi.object(userAddressValidationObject);
    userValidationObject.address = Joi.array().items(addressValidationSchema).min(1).required() // Assuming ISO format date string (YYYY-MM-DD)

    const userValidationSchema = Joi.object(userValidationObject);

    const {error,value } = await userValidationSchema.validate(req?.body);
    console.log(error)
    if(error){
        return res.status(BAD_REQUEST).json({
        status:false,
        message:error?.details?.[0]?.message
        })
    }else{
        const { userId } = req?.params
        const emailValidation = await uniqueEmail(req?.body?.email,userId);
        if (!emailValidation.status) {
            return res.status(BAD_REQUEST).json({
                status: false,
                message: emailValidation.message
            });
        }
        const mobileValidation = await uniqueMobileNumber(req?.body?.mobileNumber,userId);
        if (!mobileValidation.status) {
            return res.status(BAD_REQUEST).json({
                status: false,
                message: mobileValidation.message
            });
        }
        if(emailValidation?.status && mobileValidation?.status ){
            next()
        }
    }
};
module.exports = {
    validateCreateUser,
    validateUpdateUser
};