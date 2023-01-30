const express = require("express");
const {
  createUser,
  signIn,
  logout,
} = require("../controllers/user");
const {
  addItemToCart,
} = require("../controllers/cart");
const {
  validate,
  signInValidator,
} = require("../middlewares/validator");
const router = express.Router();



// USER

router.post("/createUser", 
    createUser
); 

router.post("/sign-in",
  signInValidator, validate, signIn); 

router.get("/logout",logout);

//_-------------------------------------------
//      USER CART 

router.post("/addItemToCart",addItemToCart);




module.exports = router;
