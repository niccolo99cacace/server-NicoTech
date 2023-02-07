const User = require("../models/user");

exports.addItemToCart = async (req, res) => {

  try {
      // Crea un oggetto cartItem con i dati passati come parametri
  
  // Utilizza findOneAndUpdate() per trovare l'utente specifico e aggiungere l'elemento al carrello
  

    const { userId, itemId, itemQuantity } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user) {
    // gestisci l'errore se l'utente non esiste
    return res.status(404).send({ message: "Utente non trovato" });
    }

      var itemIndex = -1;
      //in questo passo controllo se nel carrello ci sono items con l'id uguale a quello che voglio aggiungere
      //nel caso ci fosse già , mi memorizzo l'indice nel carrello di quell'elemento già presente
      for (var i = 0; i < user.cart.length; i++) {
        if (user.cart[i].itemId == itemId) {
          itemIndex = i;
          break;
        }
      }
      //se l'item non è già nel carrello allora lo aggiungo
      if (itemIndex === -1) {
        user.cart.push({ itemId: itemId, itemQuantity: itemQuantity });
      }
      //se è già presente , aumento la quantità
      else {
        user.cart[itemIndex].itemQuantity += itemQuantity;
      }

      await user.save();
      res.json(user);
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


  
exports.removeItemById = async (req, res) => {  
  
  try {
  const { userId, itemId } = req.body;
  
const user = await User.findOne({ userId });
if (!user) throw new Error("Utente non trovato");

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
  const { userId, itemId, itemQuantity } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const cartItemIndex = await user.cart.findIndex(item => item.itemId == itemId);
  if (cartItemIndex === -1) throw new Error('Item not found in cart');

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
  console.log(userId);

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const cartItems = await user.populate("cart.itemId");

  res.json(cartItems.cart);
} catch (error) {
  throw new Error(error);
}
};
