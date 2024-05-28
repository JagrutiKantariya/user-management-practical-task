var express = require('express');
var router = express.Router();
const {createUser,getUser,updateUser} = require('../controllers/userController')
const {validateCreateUser,validateUpdateUser} = require('../helper/validation')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/addUser',validateCreateUser,createUser);
router.post('/updateUser/:userId',validateUpdateUser,updateUser);
router.get('/getUsers',getUser);

module.exports = router;
