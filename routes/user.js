const express = require("express");
const {
  tokenBlacklist,
  createUser,
  signIn,
  logout,
  authenticatedOrNot,
} = require("../controllers/user");
const {
  addItemById,
  removeItemById,
  updateItemsCounter,
  getCartItemsByUser,
  getCartItemsNumberByUserId,
} = require("../controllers/cart");
const {
  validate,
  signInValidator,
} = require("../middlewares/validator");
const router = express.Router();
const controlTokenAndSessionCart= require("../middlewares/is-auth");


// USER

router.post("/createUser", 
    createUser
); 


//authMiddleware(tokenBlacklist),
router.post("/sign-in",
signInValidator, validate,  signIn); 

router.get("/logout",logout);

router.get("/authenticatedOrNot",controlTokenAndSessionCart(tokenBlacklist),authenticatedOrNot)

//_-------------------------------------------
//      USER CART 

router.post("/addItemById",addItemById);

router.post("/removeItemById",removeItemById);

router.post("/updateItemsCounter",updateItemsCounter);

router.get("/getCartItemsByUser",getCartItemsByUser);

router.get("/getCartItemsNumberByUserId",getCartItemsNumberByUserId);


module.exports = router;
