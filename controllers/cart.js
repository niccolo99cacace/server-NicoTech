const User = require("../models/user");

exports.addItemById = async (req, res) => {
  try {
    // Crea un oggetto cartItem con i dati passati come parametri

    // Utilizza findOneAndUpdate() per trovare l'utente specifico e aggiungere l'elemento al carrello

    const { itemId, itemQuantity } = req.body;
    //per dire al server se l'item da aggiungere sta già nel carrello
    var double;

    const userAuth = await JSON.parse(req.cookies.auth);
    const userId = userAuth.userId;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    var itemIndex = -1;
    //in questo passo controllo se nel carrello ci sono items con l'id uguale a quello che voglio aggiungere
    //nel caso ci fosse già , mi memorizzo l'indice nel carrello di quell'elemento già presente
    for (var i = 0; i < user.cart.length; i++) {
      if (user.cart[i].itemId == itemId) {
        itemIndex = i;
        double = true;
        break;
      }
    }
    //se l'item non è già nel carrello allora lo aggiungo
    if (itemIndex === -1) {
      user.cart.push({ itemId: itemId, itemQuantity: itemQuantity });
      double = false;
    }
    //se è già presente , aumento la quantità
    else {
      user.cart[itemIndex].itemQuantity += itemQuantity;
    }

    await user.save();

    res.json({ double: double });
    console.log({ double: double });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Errore nel server" });
  }
};


exports.addItemSessionCart = async (req, res) => {
  try {
    
    const sessionCart = await JSON.parse(req.cookies.sessionCart);

    const { itemId, itemQuantity } = req.body;
    //per dire al server se l'item da aggiungere sta già nel carrello
    var double;

    var itemIndex = -1;
    //in questo passo controllo se nel carrello ci sono items con l'id uguale a quello che voglio aggiungere
    //nel caso ci fosse già , mi memorizzo l'indice nel carrello di quell'elemento già presente
    for (var i = 0; i < sessionCart.length; i++) {
      if (sessionCart[i].itemId == itemId) {
        itemIndex = i;
        double = true;
        break;
      }
    }
    //se l'item non è già nel carrello allora lo aggiungo
    if (itemIndex === -1) {
      sessionCart.push({ itemId: itemId, itemQuantity: itemQuantity });
      double = false;
    }
    //se è già presente , aumento la quantità
    else {
      sessionCart[itemIndex].itemQuantity += itemQuantity;
    }

    // Imposta il cookie sessionCart con l'array aggiornato
    res.cookie("sessionCart", JSON.stringify(sessionCart));

    console.log({ double: double });
    res.json({ double: double });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Errore nel server" });
  }
};

//ritorna il carrello in base allo specifico utente
exports.getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({ _id: userId }, "cart");
    res.json(user.cart);
  } catch (error) {
    throw new Error(error);
  }
};

//per eliminare l'item dal carrello
exports.removeItemById = async (req, res) => {
  try {
    const { itemId } = req.body;

    const userAuth = await JSON.parse(req.cookies.auth);
    const userId = userAuth.userId;
    console.log(userId);
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $pull: { cart: { itemId } } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
};

//quando sto nel carrello posso decidere di modificare la quantità di item da prendere
exports.updateItemsCounter = async (req, res) => {
  try {
    const { itemId, itemQuantity } = req.body;

    const userAuth = await JSON.parse(req.cookies.auth);
    const userId = userAuth.userId;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const cartItemIndex = await user.cart.findIndex(
      (item) => item.itemId == itemId
    );
    if (cartItemIndex === -1) throw new Error("Item not found in cart");

    user.cart[cartItemIndex].itemQuantity = itemQuantity;
    await user.save();
    res.json(user.cart);
  } catch (error) {
    throw new Error(error);
  }
};

//dato l'id dell'utente, ti restituisce un array con oggetti con chiave "ItemId" contenenti un altro oggetto
//con tutti gli attributi dello specifico item e poi , nel primo oggetto "itemQuantity" e l'id dello specifico oggetto
//del carrello
exports.getCartItemsByUser = async (req, res) => {
  try {
    const userAuth = await JSON.parse(req.cookies.auth);
    const userId = userAuth.userId;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const cartItems = await user.populate("cart.itemId");

    res.json(cartItems.cart);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getCartItemsNumberByUserId = async (req, res) => {
  try {
    const userAuth = await JSON.parse(req.cookies.auth);
    const userId = userAuth.userId;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    var count = 0;

    user.cart.forEach((cartItem) => {
      count++;
    });
    res.json(count);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getSessionCartItemsNumber = async (req, res) => {
  try {
    const sessionCartCount = JSON.parse(req.cookies.sessionCart);
    
    const count = sessionCartCount.length;

    res.json(count);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
