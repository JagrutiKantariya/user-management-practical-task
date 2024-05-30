const mongoose = require("mongoose")
const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },
    addressLine1:{
        type:String,
        require: true
    },
    addressLine2:{
        type:String,
        require: false,
        default:null
    },
    pincode:{
        type:Number,
        require: true,
        min: 1111, max: 999999
    },
    city:{
        type:String,
        require: true
    },
    state :{
        type:String,
        require: true
    },
    addressType :{
        type: String,
        enum : ['home','office'],
        default:'home'        
    }
},{timestamps:true,versionKey:false})

addressSchema.index({city:1})

const userModel = mongoose.model('address',addressSchema)

module.exports = userModel