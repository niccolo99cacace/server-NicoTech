const express = require("express");
const {
  tokenBlacklist,
  createUser,
  signIn,
  logout,
} = require("../controllers/user");
const {
  addItemById,
  removeItemById,
  updateItemsCounter,
  getCartItemsByUser,
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


//authMiddleware(tokenBlacklist),
router.post("/sign-in",
signInValidator, validate,  signIn); 

router.get("/logout",logout);

//_-------------------------------------------
//      USER CART 

router.post("/addItemById",addItemById);

router.post("/removeItemById",removeItemById);

router.post("/updateItemsCounter",updateItemsCounter);

router.get("/getCartItemsByUser",getCartItemsByUser);


module.exports = router;
