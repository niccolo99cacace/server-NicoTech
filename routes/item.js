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

module.exports = router;
