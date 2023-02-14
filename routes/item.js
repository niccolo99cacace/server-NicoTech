const express = require("express");
const router = express.Router();
const {
    home,
    createItem,
    getItemById,
  } = require("../controllers/item"); 

  const {
    tokenBlacklist,
  } = require("../controllers/user");

router.get("/home",   home);

router.post("/createItem", createItem);

router.post("/getItemById",getItemById);



module.exports = router;
