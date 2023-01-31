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


// Verifica le credenziali dell'utente e genera un token JWT

  const token = jwt.sign({ id:user._id }, process.env.JTW_TOKEN_SIGNATURE, {
    expiresIn: "7d",
  });

//oggetto contenente token e id che memorizzo nel cookie
  const cookieData = {
    token: token,
    userId: _id
  };

  /*memorizzo  il token nel cookie del browser 
  res.cookie per impostare un cookie chiamato "token" con il valore del token generato. 
  La proprietà httpOnly è impostata su true per prevenire l'accesso al cookie da parte 
  di script esterni (come i script di un attacco XSS). La proprietà sameSite è impostata 
  su strict per prevenire l'invio del cookie a siti esterni, e la proprietà secure è impostata
   su true solo se l'ambiente è in produzione. Questo impedirà l'invio del cookie su connessioni non sicure (HTTP).  */

   const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 giorni in millisecondi
  res.cookie('auth', JSON.stringify(cookieData), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    //il cookie muore doppo 7 giorni 
    expires: new Date(Date.now() + expiresIn)
  });

//queste 2 righe servono per salvare sul database ll'id dell'utente ed il token 
  req.session.token = token;
  req.session.userId = _id; 
  await req.session.save();

  res.json({token:token , user:_id});
} catch (error) {
  res.status(200).json({error:error});
}
};





  exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) throw err; 
      res.json({ ok:"logout effettuato"});     
    });
  };

  



      