const User = require("../models/user");
const { sendError } = require("../utils/helper");
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "This email is already in use!");

  const newUser = new User({ name, email, password});
  await newUser.save();

  res.status(201).json({user:{
    message:
      "User added!",
  }});
};



exports.signIn = async (req, res, next) => {

  try{
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email/Password mismatch!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password mismatch!");

  const { _id, name } = user;

console.log(user._id);

// Verifica le credenziali dell'utente e genera un token JWT

  const token = jwt.sign({ id:user._id }, process.env.JTW_TOKEN_SIGNATURE, {
    expiresIn: "7d",
  });
console.log(token);

//queste 2 righe servono per salvare sul database la sessione ed il token 
  req.session.token = token;
  await req.session.save();

  res.json({token:token , user:name});
} catch (error) {
  res.status(400).send("Server error during authentication");
}
};





  exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) throw err; 
      res.json({ ok:"logout effettuato"});     
    });
  };

  



      