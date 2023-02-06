const express = require("express");
const {
  tokenBlacklist,
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
const authMiddleware = require("../middlewares/is-auth");
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
signInValidator, validate, authMiddleware(tokenBlacklist), signIn); 

router.get("/logout",logout);

//_-------------------------------------------
//      USER CART 

router.post("/addItemToCart",addItemToCart);

router.post("/getCartByUserId",getCartByUserId);

router.post("/removeItemById",removeItemById);

router.post("/updateItemsCounter",updateItemsCounter);


module.exports = router;
