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



//la query fatta dal motore di ricerca 
exports.getSearchResults = async (req, res) => {
const {query}  = req.body;

try {

  //stiamo cercando tutti gli item con nome parzialmente corrispondente alla query (ovvero ciò che è stato inserito dall'utente)
  //$regex fa in modo che se parte di quello inserito nella query sta nel titolo allora la corrispondenza vale
  //ad esempio se query="book" e title="the life book" la corrispondenza è valida o anche se cerco semplicemente "6" ,
  //mi verrà restituito ogni item con il numero 6 nel titolo
  //$options è un attributo opzionale e con 'i' diciamo che la corrispondenza è case INsensitive
  //infine con toArray() restituiamo i risultati raccolti in un array
  //grazie all'operatore $or , oltre al titolo dell'item, vengono controllate anche le corrispondenze con il brand
  //e con la categoria
  const results = await Item.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ]
  });
  res.json(results);
} catch (error) {
  console.log(error);
  res.status(500).json({ message: 'Internal server error' });
};
};

//per i suggerimenti AJAX , dato il contenuto della barra di ricera 
//con suggerimenti si intende il caricamento automatico dei primi 10 item che matchano con il contenuto 
//della barra di ricerca 
//Alla fine questa funzione è uguale a quella della ricerca normale , solo che questa restituisce solo 10 items max
exports.getSuggestions = async (req, res) => {
  const {query}  = req.body;

  try {
    const results = await Item.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(10)
    //specifica i campi da includere o escludere nel risultato. In questo caso, vengono inclusi solo 
    //i campi "name", "brand" e "category", mentre viene escluso il campo "_id" 
    //(ADESSO NON LO USIAMO)

    //.select("name brand category -_id");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  };
};


//restituiamo gli item considerando i filtri applicati 
//NOTA che si considerano tutti i casi , ovvero anche quando alcuni filtri sono imposti ed altri no
exports.getFilteredItems = async (req, res) => {

  const {categories, brands, minPrice, maxPrice}  = req.body;
  console.log(categories);
  console.log(brands);
  console.log(minPrice);
  console.log(maxPrice);
  try {
    let query = {};

    if (categories!==undefined && categories.length>0) {
      console.log("aaa");
      query.category = { $in: categories };
    }

    if (brands!==undefined && brands.length>0){
      console.log("bbbb");
      query.brand = { $in: brands };
    }

    if (minPrice!==undefined || maxPrice!==undefined) {
      console.log("ccc");
      query.price = {};

      if (minPrice!==undefined) {
        console.log("dddd");
        query.price.$gte = minPrice;
      }

      if (maxPrice!==undefined) {
        console.log("eee");
        query.price.$lte = maxPrice;
      }
    }

    const items = await Item.find(query);
console.log(items);
    res.json(items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  };
};