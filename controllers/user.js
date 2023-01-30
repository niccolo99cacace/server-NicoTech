const User = require("../models/user");
const { sendError } = require("../utils/helper");

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
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email/Password mismatch!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password mismatch!");

  const { _id, name } = user;

  req.session.isAuth = true;
  req.session.idUser = user._id;

res.json({ user: { id: _id, name, email} });
};



  exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) throw err; 
      res.json({ ok:"logout effettuato"});     
    });
  };

  



      