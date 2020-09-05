const express = require("express")
const router = express.Router()
const check_auth = require("../middleware/check_auth")
const UsersController = require('../controllers/users')


router.post('/signup', UsersController.user_signup)

router.post('/login', UsersController.user_login)

router.delete("/:userId", check_auth, UsersController.user_delete)

module.exports = router