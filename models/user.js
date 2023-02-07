const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//l'utente contiene il campo "cart" , un array di elementi cartItemSchema , ovvero l'id dell'item e la quantità


const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  itemQuantity: {
  type: Number,
  trim: true,
  required: true,
}
});


const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type:[cartItemSchema],
    default:[],
  }

});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

module.exports = mongoose.model("User", userSchema);

