const User = require("../models/user");

exports.addItemToCart = async (req, res) => {
  // Crea un oggetto cartItem con i dati passati come parametri
  const { userId, itemId, itemQuantity } = req.body;
  // Utilizza findOneAndUpdate() per trovare l'utente specifico e aggiungere l'elemento al carrello
  
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
    // gestisci l'errore se l'utente non esiste
    return res.status(404).send({ message: "Utente non trovato" });
    }

      var itemIndex = -1;
      //in questo passo controllo se nel carrello ci sono items con l'id uguale a quello che voglio aggiungere
      //nel caso ci fosse già , mi memorizzo l'indice nel carrello di quell'elemento già presente
      for (var i = 0; i < user.cart.length; i++) {
        if (user.cart[i].itemId === itemId) {
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
