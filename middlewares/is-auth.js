const jwt = require('jsonwebtoken');
require("dotenv").config();


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



function tokenVerification(req,authToken) {

    try {

      const decoded = jwt.verify(authToken, process.env.JTW_TOKEN_SIGNATURE,);
       req.user = decoded.user;
     console.log("TOKEN VALIDO");
     return "ok";

  } catch (error) {
    console.log("VALIDAZIONE TOKEN NON ANDATA A BUON FINE");
    return "error";
  }

};



/*
0 --> SI TOKEN valido
1 --> NO TOKEN NO SESSIONCART (creato)
2 --> NO TOKEN SI SESSIONCART

*/



function controlTokenAndSessionCart(tokenBlacklist) {
  return (req, res, next) => {
    try {
      const sessionCart = [];

   //il cookie auth esiste, allora controllo se ci sta il token
    if(req.cookies.auth !== undefined ){
    
      //controllo se il token è valido
      if (JSON.parse(req.cookies.auth).token !== undefined) {

        const authToken = JSON.parse(req.cookies.auth).token;

      if (tokenBlacklist.includes(authToken)==false  && 
      (tokenVerification(req,authToken)).localeCompare("ok") == 0  ){
      //se il token è valido restituisco 0
      req.result = 0; 
      next();
     }
     else console.log("TOKEN NON VALIDO");
    }
     else console.log("COOKIE PRESENTE MA TOKEN NO");
    }
    else console.log("COOKIE NON PRESENTE");    

     //IL TOKEN NON è presente o non è valido , allora passiamo a controllare se il sessionCart esista
      //se il sessionCart cookie non esiste allora lo devo creare 
      if ( req.cookies.sessionCart === undefined) {

  const cookieData = sessionCart;

   const expiresIn =365 * 24 * 60 * 60 * 1000; // 1 anno in millisecondi
  res.cookie('sessionCart', JSON.stringify(cookieData), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    //il cookie muore dopo 1 anno 
    expires: new Date(Date.now() + expiresIn)
  });
        //e passo cod 2 
        req.result = 1;
        next();}

        //Se il sessionCart cooke ci sta allora semplicemente cod 3
        else{ req.result = 2; next(); }
  


} catch (error) {
    console.log(error);
}

}};



module.exports = controlTokenAndSessionCart;