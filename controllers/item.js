const Item = require("../models/item");
const Review = require("../models/review");
const { sendError } = require("../utils/helper");

//import utili a configurare cloudinary per le immagini
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

exports.home = async (req, res, next) => {
  try {
    const items = await Item.find();

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getItemById = async (req, res) => {
  const { _id } = req.body;

  Item.findById(_id)
    .then((doc) => {
      if (!doc) {
        // Handle case where no document is found
        console.log("l'item cercato tramite l'id non è presente nel database");
      } else {
        // Convert the Mongoose object to a plain JavaScript object
        const plainObject = doc.toObject();
        console.log(plainObject);
        res.json(plainObject);
        
      }
    })
    .catch((error) => {
      // Handle error
      console.log("la richiesta dello specifico item ha causato un errore.");
      console.log(error);
      res.json({ error: error });
    });
};

//la query fatta dal motore di ricerca
exports.getSearchResults = async (req, res) => {
  const { query } = req.body;

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
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//per i suggerimenti AJAX , dato il contenuto della barra di ricera
//con suggerimenti si intende il caricamento automatico dei primi 10 item che matchano con il contenuto
//della barra di ricerca
//Alla fine questa funzione è uguale a quella della ricerca normale , solo che questa restituisce solo 10 items max
exports.getSuggestions = async (req, res) => {
  const { query } = req.body;

  try {
    const results = await Item.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).limit(10);
    //specifica i campi da includere o escludere nel risultato. In questo caso, vengono inclusi solo
    //i campi "name", "brand" e "category", mentre viene escluso il campo "_id"
    //(ADESSO NON LO USIAMO)

    //.select("name brand category -_id");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//restituiamo gli item considerando i filtri applicati
//NOTA che si considerano tutti i casi , ovvero anche quando alcuni filtri sono imposti ed altri no
exports.getFilteredItems = async (req, res) => {
  const { categories, brands, minPrice, maxPrice } = req.body;
  try {
    let query = {};

    if (categories !== undefined && categories.length > 0) {
      console.log("aaa");
      query.category = { $in: categories };
    }

    if (brands !== undefined && brands.length > 0) {
      console.log("bbbb");
      query.brand = { $in: brands };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      console.log("ccc");
      query.price = {};

      if (minPrice !== undefined) {
        console.log("dddd");
        query.price.$gte = minPrice;
      }

      if (maxPrice !== undefined) {
        console.log("eee");
        query.price.$lte = maxPrice;
      }
    }

    const items = await Item.find(query);
    console.log(items);
    res.json(items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//creazione di una recensione
exports.createReview = async (req, res) => {
  const { rating, description } = req.body;

  try {
    const userId = JSON.parse(req.cookies.auth).userId;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const username = user.name;
    console.log({ username, rating, description });
    const newReview = new Review({ username, rating, description });
    await newReview.save();

    res.status(201).json({
      message: "Review added!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReviewsByItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = await Item.findById(itemId);
    if (!item) throw new Error("item not found");

    const itemReviews = await item.populate("reviews.reviewId");

console.log(itemReviews.reviews);
    res.json(itemReviews.reviews);
  } catch (error) {
    console.log(error);
    throw error;
  }
};


exports.deleteItemById = async (req, res) => {
  try {
    const { itemId } = req.body;
console.log(itemId);
const result = await Item.deleteOne({ _id: itemId });
// Se l'item non è stato trovato, lancia un'eccezione
if (result.deletedCount === 0) throw new Error('Item not found'); 
console.log(result);
    res.json(result);
  } catch (error) {
    throw new Error(error);
  }
};


  exports.updateItemPrice = async (req, res) => {
  try {
    const { itemId,newPrice } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      // se l'item con l'id specificato non esiste, restituisce un errore
      throw new Error("Item non trovato"); 
    }

    item.price = newPrice; // aggiorna il prezzo dell'item

    await item.save(); // salva le modifiche nel database

    return item; // restituisce l'item aggiornato
  } catch (error) {
    console.error(error);
    throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
  }
}


exports.updateItemPrice = async (req, res) => {
  try {
    const { itemId,newPrice } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      // se l'item con l'id specificato non esiste, restituisce un errore
      throw new Error("Item non trovato"); 
    }

    item.price = newPrice; // aggiorna il prezzo dell'item

    await item.save(); // salva le modifiche nel database

    return item; // restituisce l'item aggiornato
  } catch (error) {
    console.error(error);
    throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
  }
}


exports.updateItemAvailability = async (req, res) => {
  try {
    const { itemId,newAvailability } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      // se l'item con l'id specificato non esiste, restituisce un errore
      throw new Error("Item non trovato"); 
    }

    item.availability = newAvailability; // aggiorna il prezzo dell'item

    await item.save(); // salva le modifiche nel database

    return item; // restituisce l'item aggiornato
  } catch (error) {
    console.error(error);
    throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
  }
}



//---------------------------------------------------------------
//sezione ADMIN per aggiunta Item

// Configura le credenziali di autenticazione di Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura la storage di Cloudinary per multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'NicoTech',
    format: async (req, file) => 'png', // Puoi specificare il formato dell'immagine caricata
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Il nome pubblico dell'immagine su Cloudinary
  },
});

// Configura il middleware multer con la storage di Cloudinary
const upload = multer({ storage });

/* 
questa funzione è il middleware creato con multer che dobbiamo usare ogni volta per caricare l'immagine 
con il nome (in tal caso image1) per caricare il file con nome specificato nel client quando lo inviamo 
multer lavora in contatto con la nostra lbreria cloudinary che abbiamo configurato per caricare le immagini su cloud 



    upload.single('image1')(req, res, async (err) => {
      if (err) {
        console.error('Error uploading image:', err);
        res.status(400).send('Error uploading image');
      } else {
        // L'immagine è stata caricata su Cloudinary, restituisci l'URL pubblico dell'immagine
        const imageUrl = req.file.path;
        console.log('Image uploaded successfully:', imageUrl);
        return imageUrl;
      }
    });


    [in uploadImagesOnCloud ho usato questa ma per più immagini]
    */




exports.createItem = async (req, res) => {
  try {

  const {
    name,
    brand,
    description,
    largeDescription,
    category,
    price,
    availability,
    image1,
    image2,
    image3,
  } = req.body;

// Carica l'immagine su Cloudinary
 const image1Url = await uploadImage(image1);
 const image2Url = await uploadImage(image2);
 const image3Url = await uploadImage(image3);
 const imageUrl = [image1Url, image2Url, image3Url];


  const newItem = new Item({
    name,
    brand,
    description,
    largeDescription,
    category,
    price,
    availability,
    imageUrl,
  });
  await newItem.save();

  res.status(201).json({
    message: "Item added!",
  });

} catch (error) {
  console.error(error);
  throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
}
};




//per caricare le 3 immagini su cloud
exports.uploadImage1OnCloud = async (req, res) => {
  try{
  upload.single('image1')(req, res, async (err) => {
    if (err) {
       console.error('Error uploading image:', err);
      res.status(400).send('Error uploading image');
    } else {
      // L'immagine è stata caricata su Cloudinary, restituisci l'URL pubblico dell'immagine
      const imageUrl = req.file.path;
      console.log('Image1 uploaded successfully:', imageUrl);
      return imageUrl;
    }
  });
  res.status(201).json({
    message: "Image added!",
  });
} catch (error) {
  console.error(error);
  throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
}
};

exports.uploadImage2OnCloud = async (req, res) => {
  try{
  upload.single('image2')(req, res, async (err) => {
    if (err) {
       console.error('Error uploading image:', err);
      res.status(400).send('Error uploading image');
    } else {
      // L'immagine è stata caricata su Cloudinary, restituisci l'URL pubblico dell'immagine
      const imageUrl = req.file.path;
      console.log('Image2 uploaded successfully:', imageUrl);
      return imageUrl;
    }
  });;
  res.status(201).json({
    message: "Image added!",
  });
} catch (error) {
  console.error(error);
  throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
}
};

exports.uploadImage3OnCloud = async (req, res) => {
  try{
  upload.single('image3')(req, res, async (err) => {
    if (err) {
       console.error('Error uploading image:', err);
      res.status(400).send('Error uploading image');
    } else {
      // L'immagine è stata caricata su Cloudinary, restituisci l'URL pubblico dell'immagine
      const imageUrl = req.file.path;
      console.log('Image3 uploaded successfully:', imageUrl);
      return imageUrl;
    }
  });
  res.status(201).json({
    message: "Image added!",
  });
} catch (error) {
  console.error(error);
  throw new Error("Errore durante l'aggiornamento del prezzo dell'item");
}
};