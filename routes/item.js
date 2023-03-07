const express = require("express");
const router = express.Router();
const {
    home,
    createItem,
    getItemById,
    getSearchResults,
    getSuggestions,
    getFilteredItems ,
    createReview,
    getReviewsByItem,
    deleteItemById,
    updateItemPrice,
    updateItemAvailability,
    uploadImage1OnCloud,
    uploadImage2OnCloud,
    uploadImage3OnCloud,
  } = require("../controllers/item"); 

  const {
    tokenBlacklist,
  } = require("../controllers/user");

router.get("/home",   home);

router.post("/createItem", createItem);

router.post("/getItemById",getItemById);

router.post("/getSearchResults",getSearchResults);

router.post("/getSuggestions",getSuggestions);
 
router.post("/getFilteredItems",getFilteredItems);

router.post("/createReview",createReview);

router.post("/getReviewsByItem",getReviewsByItem);

router.post("/deleteItemById",deleteItemById);

router.post("/updateItemPrice",updateItemPrice);

router.post("/updateItemAvailability",updateItemAvailability);

router.post("/uploadImage1OnCloud",uploadImage1OnCloud,);

router.post("/uploadImage2OnCloud",uploadImage2OnCloud,);

router.post("/uploadImage3OnCloud",uploadImage3OnCloud,);

module.exports = router;


