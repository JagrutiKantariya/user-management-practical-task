const { faker } = require('@faker-js/faker');
const fs = require("fs")
const userModel = require('../models/user.model')
const addressModel = require('../models/address.model')
const _ = require('underscore')

// Generate dummy user data
const generateUsers = async(count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const user = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            
            mobileNumber: faker.phone.number().replace(/[-\D ()]/g, '').slice(0, 10),
          };
          const address= [{
            addressLine1: faker.location.streetAddress(),
            addressLine2: faker.location.secondaryAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              pincode: faker.location.zipCode(),
          },
          {
              addressLine1: faker.location.streetAddress(),
              addressLine2: faker.location.secondaryAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                pincode: faker.location.zipCode(),
            },
            {
              addressLine1: faker.location.streetAddress(),
              addressLine2: faker.location.secondaryAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                pincode: faker.location.zipCode(),
            }]
            user.address = address
          users.push(user)

      
        }
        try {
            const jsonData = JSON.stringify(users, null, 2);
            fs.writeFileSync('users.json', jsonData);
            console.log('User data has been written to users.json file.');
        } catch (error) {
            console.error('Error writing user data to file:', error);
        }
    return users;
};

// Example: Generate 50 dummy users
const dummyUsers = generateUsers(50);
console.log(dummyUsers);