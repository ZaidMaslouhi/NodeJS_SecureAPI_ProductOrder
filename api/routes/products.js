const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const multer = require("multer")

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

const Product = require("../models/product");
const check_auth = require("../middleware/check_auth");

router.get("/", (req, res, next) => {
  Product.find()
    .select("_id name price productImage")
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id
            }
          }
        })
      }
      //   if (docs.length >= 0) {
      res.status(200).json(response)
        //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       })
      //   }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

router.post("/", check_auth, upload.single('productImage'), (req, res, next) => {
  // console.log(req.file)
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product.save()
    .then(result => {
      console.log(result)
      res.status(201).json({
        message: "Created product successfully",
        createdProduct: {
            name: result.name,
            price: result.price,
            productImage: result.productImage,
            _id: result._id,
            request: {
                type: 'GET',
                url: "http://localhost:3000/products/" + result._id
            }
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId
  Product.findById(id)
    .select('_id name price productImage')
    .then(doc => {
      console.log("From database", doc)
      if (doc) {
        res.status(200).json({
            product: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products'
            }
        })
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
})

router.patch("/:productId", check_auth, (req, res, next) => {
  const id = req.params.productId
  const updateOps = {
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  }
  Product.update({ _id: id }, { $set: updateOps })
    .then(result => {
      res.status(200).json({
          message: 'Product updated',
          request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + id
          }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

router.delete("/:productId", check_auth, (req, res, next) => {
  const id = req.params.productId
  Product.remove({ _id: id })
    .then(result => {
      res.status(200).json({
          message: 'Product deleted',
          request: {
              type: 'POST',
              url: 'http://localhost:3000/products',
              body: { name: 'String', price: 'Number' }
          }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

module.exports = router