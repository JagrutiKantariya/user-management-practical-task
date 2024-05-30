const { OK, BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const userModel = require('../models/user.model')
const addressModel = require('../models/address.model')
const _ = require('underscore');
const ObjectId = require('mongoose').Types.ObjectId;
// Custom validation function to check for unique email
const uniqueEmail = async (value, _id = null) => {
    try {
        var query = { email: value }
        console.log(_id)
        if (_id) {
            query = { _id: { $ne: new ObjectId(_id) }, ...query }
        }
        const userExist = await userModel.findOne(query);
        if (userExist) {
            return { status: false, message: 'Email is already in use' };
        }
        return { status: true };

    } catch (error) {
        return { status: false, message: 'Internal server error' };
    }
};

// Custom validation function to check for unique mobile number
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
        return { status: false, message: 'Internal server error' };
    }
};
const userController = {
    createUser: async (req, res) => {
        const { firstName, lastName, email, mobileNumber, birthDate, address } = req.body
            const input = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobileNumber: mobileNumber,
                birthDate: birthDate
            }
        try {
            
            const userData = await userModel.create(input)
            if (userData) {
                for (const addr of address) {
                    addr.userId = userData?._id;
                }
                const addressIdsObj = await addressModel.create(address)
                const addressIds = _.pluck(addressIdsObj, '_id')

                await userModel.updateOne({ _id: userData?._id }, { $set: { addresses: addressIds } })
                return res.status(CREATED).json({
                    status: true,
                    message: 'success'
                })
            } else {
                return res.status(INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: 'something went wrong'
                })
            }

        }
        catch (error) {
            // if error occur delete inserted record
            const deletedUserData = await userModel.findOneAndDelete({email:input?.email}) // delete user data
            await addressModel.deleteMany({userId: deletedUserData?._id}) // delete addresses
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: false,
                message: error?.message
            })
        }
    },
    getUser: async (req, res) => {
        try {
            const { searchQuery, minAge, maxAge, city } = req?.query
            let filter = {}
            if (searchQuery && searchQuery != "") {
                filter = {
                    $or: [{ firstName: new RegExp(searchQuery, 'i') }, { lastName: new RegExp(searchQuery, 'i') }, { email: new RegExp(searchQuery, 'i') }]
                }
            }
            if (city && city != "") {
                filter = {
                    ...filter,
                    'addressData.city': new RegExp(city, 'i')

                }
            }

            if (minAge && minAge != "") {
                filter = {
                    ...filter,
                    age: { $gte: Number(minAge) }
                }
            }
            if (maxAge && maxAge != "") {
                filter = {
                    ...filter,
                    age: { $lte: Number(maxAge) }
                }
            }
            if (minAge && maxAge) {
                filter = {
                    ...filter,
                    age: { $gte: Number(minAge), $lte: Number(maxAge) }

                }
            }
            const userData = await userModel.aggregate([
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'addresses',
                        foreignField: '_id',
                        as: "addressData"
                    },
                },
                {
                    $addFields: {
                        age: {
                            $subtract: [
                                { $year: new Date() },
                                { $year: '$birthDate' }
                            ]
                        }
                    }
                },

                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        mobileNumber: 1,
                        birthDate: 1,
                        age: 1,
                        createdAt: 1,
                        addressData: {
                            addressLine1: 1,
                            addressLine2: 1,
                            pincode: 1,
                            city: 1,
                            state: 1,
                            addressType: 1
                        },

                    }
                },
                { $match: filter }

            ])
            return res.status(OK).json({
                status: true,
                message: 'success',
                data: userData
            })
        }
        catch (error) {
            console.log("here errors",error)
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: false,
                message: error?.message
            })
        }
    },
    updateUser: async (req, res) => {
        try {
            const { userId } = req?.params
            const { firstName, lastName, email, mobileNumber, birthDate, address } = req.body

            const input = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobileNumber: mobileNumber,
                birthDate: birthDate
            }

            var modifiedAddress = []
            // get old Address
            const oldAddress = await addressModel.find({ userId: new ObjectId(userId) })

            const removedAddresses = oldAddress.filter(oldAddress => !address.some(newAddress => oldAddress._id?.toString() === newAddress._id?.toString()));

            // Remove addresses that are no longer present
            if (removedAddresses.length > 0) {
                await addressModel.deleteMany({ _id: { $in: removedAddresses.map(address => address._id) } });
            }
            // Update or create addresses
            for (const addressObj of address) {
                if (addressObj?._id) {
                    await addressModel.updateOne({ _id: new ObjectId(addressObj._id) }, { $set: addressObj });
                    modifiedAddress.push(addressObj?._id);
                } else {
                    // If the address doesn't have an _id, create it
                    addressObj.userId = new ObjectId(userId);
                    let newAddress = await addressModel.create(addressObj);
                    modifiedAddress.push(newAddress._id);
                }
            }

            input.addresses = modifiedAddress

            const userData = await userModel.updateOne({ _id: new ObjectId(userId) }, { $set: input })
            if (userData) {
                return res.status(OK).json({
                    status: true,
                    message: 'user information updated successfully'
                })
            } else {
                return res.status(INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: 'something went wrong'
                })
            }

        }
        catch (error) {
            console.log("here error",error)
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: false,
                message: error?.message
            })
        }
    }
}

module.exports = userController