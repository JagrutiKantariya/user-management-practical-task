const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        require: true
    },
    lastName:{
        type:String,
        require: true
    },
    email:{
        type:String,
        require: true
    },
    mobileNumber:{
        type:String,
        require: true
    },
    birthDate :{
        type:Date,
        require: true
    },
    addresses: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'address', 
            default:null
        }
    ] // Array of ObjectIDs referencing Address documents
},{timestamps:true,versionKey:false})

userSchema.index({firstName:1})
userSchema.index({lastName:1})
userSchema.index({email:1})
const userModel = mongoose.model('users',userSchema)

module.exports = userModel