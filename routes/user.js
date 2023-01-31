const express = require("express");
const {
  createUser,
  signIn,
  logout,
} = require("../controllers/user");
const {
  addItemToCart,
  getCartByUserId,
  removeItemById,
  updateItemsCounter,
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

router.post("/getCartByUserId",getCartByUserId);

router.post("/removeItemById",removeItemById);

router.post("/updateItemsCounter",updateItemsCounter);


module.exports = router;
