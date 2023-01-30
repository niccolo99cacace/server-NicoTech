const express = require("express");
const router = express.Router();
const {
    home,
    createItem,
    getItemById,
  } = require("../controllers/item");



router.get("/home", home);

router.post("/createItem", createItem);

router.post("/getItemById",getItemById);



module.exports = router;
