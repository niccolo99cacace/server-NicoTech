const Item = require("../models/item");
const { sendError } = require("../utils/helper");

exports.home = async (req, res, next) => {
  try {
    
    const items = await Item.find();
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createItem = async (req, res) => {
  const { name, brand, description, largeDescription, category, price, availability, imageUrl } =
    req.body;

  const newItem = new Item({ name, brand, description,largeDescription, category, price, availability, imageUrl });
  await newItem.save();

  res.status(201).json({
    message: "Item added!",
  });
};


exports.getItemById = async (req, res) => {
  const {_id} =    req.body;

  Item.findById(_id).then(doc => {
    if (!doc) {
      // Handle case where no document is found
      console.log("l'item cercato tramite l'id non è presente nel database");
    } else {
      // Convert the Mongoose object to a plain JavaScript object
      const plainObject = doc.toObject();
      res.json(plainObject );
      // Return the plain JavaScript object
      return plainObject;
    }
  })
  .catch(error => {
    // Handle error
    console.log("la richiesta dello specifico item ha causato un errore.")
      console.log(error);
      res.json({error:error });
  }); 
};
