const express = require("express");
const router = express.Router();
const {
    home,
    createItem,
    getItemById,
  } = require("../controllers/item"); 
  const controlTokenAndSessionCart= require("../middlewares/is-auth");
  const {
    tokenBlacklist,
  } = require("../controllers/user");

router.get("/home", controlTokenAndSessionCart(tokenBlacklist),  home);

router.post("/createItem", createItem);

router.post("/getItemById",getItemById);



module.exports = router;
