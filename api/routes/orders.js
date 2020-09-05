const express = require("express")
const router = express.Router()
const check_auth = require("../middleware/check_auth")
const OrdersController = require("../controllers/orders")

// Handle incoming GET requests to /orders
router.get("/", check_auth, OrdersController.orders_get_all)

router.post("/", check_auth, OrdersController.orders_create_order)

router.get("/:orderId",  check_auth, OrdersController.orders_get_order)

router.delete("/:orderId",  check_auth, OrdersController.orders_delete_order)

module.exports = router
