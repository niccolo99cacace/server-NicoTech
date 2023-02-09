const User = require("../models/user");

//per eliminare l'item dal carrello 
exports.removeItemById = async (req, res) => {  
  
  try {
  const { itemId } = req.body;

  const userAuth = await JSON.parse(req.cookies.auth);
  const userId = userAuth.userId;
  console.log(userId);
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

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

//per aggiungere l'item al carrello 
exports.addItemById = async (req, res) => {  
  
  try {
  const { itemId, itemQuantity } = req.body;
  console.log(itemId);
  console.log(itemQuantity);

  const userAuth = await JSON.parse(req.cookies.auth);
  const userId = userAuth.userId;
  console.log(userId);
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

const updatedUser = await User.findOneAndUpdate(
  { userId },
  { $push: { cart: { itemId: itemId, itemQuantity: itemQuantity } } },
  //serve a ritornare il carrello aggiornato
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

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const cartItems = await user.populate("cart.itemId");

  res.json(cartItems.cart);
} catch (error) {
  throw new Error(error);
}
};
