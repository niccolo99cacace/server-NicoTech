const { sendError } = require("../utils/helper");
const jwt = require('jsonwebtoken');

/*  Il token serve come identificatore univoco per l'utente che si è autenticato correttamente. 
Invece di interrogare il database per verificare se l'utente ha una sessione valida ad ogni richiesta,
 è possibile inviare il token con ogni richiesta e utilizzare un middleware per verificare la validità
  del token sul lato server. Questo aumenta l'efficienza e la sicurezza del sistema, poiché le informazioni
   sulle sessioni degli utenti non vengono memorizzate sul lato client e la verifica viene effettuata sul lato server.
*/
 
/*
Il metodo jwt.verify di JSON Web Token (JWT) verifica un token firmato, decodificandolo
 e controllando la firma. Prende in ingresso tre argomenti: il token che si desidera verificare, la chiave segreta
  utilizzata per firmare il token e una serie di opzioni (opzionali) per la verifica. Il metodo restituisce 
  un oggetto che contiene le informazioni contenute 
nel payload del token, se la verifica del token riesce. In caso contrario, viene generata un'eccezione.
*/


exports.authMiddleware = (req, res, next) => {

  if(req.cookies.auth === undefined ){console.log("Access denied. No token provided.");
  return res.status(400).json({ errror: "token doesn't exists" });}

      //per recuperare id dell'utente e token dal cookie 
    const userAuth = JSON.parse(req.cookies.auth);
  

  if (userAuth.token === undefined) {console.log("Access denied. No token provided.");
  return res.json({ errror: "token doesn't exists" });}
  

  try {
    const decoded = jwt.verify(userAuth.token, process.env.JTW_TOKEN_SIGNATURE);
    req.user = decoded;
    console.log("already authenticated");
    next();
  } catch (error) {
    console.log("errore del server durante il controllo di validità del token");
    console.log(error);
  }

};
