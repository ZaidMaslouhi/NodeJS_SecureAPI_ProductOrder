const express = require("express")
const router = express.Router()
const multer = require("multer")
const check_auth = require("../middleware/check_auth")
const ProductsControllers = require("../controllers/products")

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, './images/')
  },
  filename: (req, file, cb)=>{
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
});

const fileFilter = (req, file, cb)=>
  (file.mimetype === 'image/jpge' || file.mimetype === 'image/png')? 
    cb(null, true) : cb(new Error('The image was not uploaded !!'), false)

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 //5MB
  },
  fileFilter: fileFilter
})

router.get("/", ProductsControllers.products_get_all)

router.post("/", check_auth, upload.single('productImage'), ProductsControllers.products_create_product)

router.get("/:productId", ProductsControllers.products_get_product)

router.patch("/:productId", check_auth, ProductsControllers.products_update_product)

router.delete("/:productId", check_auth, ProductsControllers.products_delete_product)

module.exports = router