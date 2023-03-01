const express = require("express");
const router = express.Router();
const {
    home,
    createItem,
    getItemById,
    getSearchResults,
    getSuggestions,
    getFilteredItems ,
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

module.exports = router;
