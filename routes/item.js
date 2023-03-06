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
module.exports = router;
