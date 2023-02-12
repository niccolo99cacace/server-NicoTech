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



function tokenVerification(token) {

    try {

     jwt.verify(token, process.env.JTW_TOKEN_SIGNATURE, { complete: true });

     return "ok";

  } catch (error) {
    
    return "error";
  }

};



/*
0 --> NO cookie  (sessionCart deve essere creato)
1 --> ci sta il token ed è valido
2 --> NO token valido o presente e NO carrello  (sessionCart deve essere creato)
3 --> NO token ma carrello SI

*/



function controlTokenAndSessionCart(tokenBlacklist) {
  return (req, res, next) => {
    try {
      var sessionCart = [];

   //se non esiste il cookie di NicoTech allora creo un carrello di sessione e invio il codice 0
    if(req.cookies.auth === undefined ){console.log("Nooooo token provided and Nooo session cart");
    console.log("nothing");
   // salvo il sessionCart nel local storage del browser
    //localStorage.setItem("sessionCart", JSON.stringify(sessionCart));
    console.log("DEVI CREARE IL SESSION CART AAAA");
    req.result = 0;
    next();
  }
  else{

    const userAuth = JSON.parse(req.cookies.auth);

    //token NON VALIDO OPPURE NON PRESENTE NEL COOKIE
    if (userAuth.token === undefined ||
       tokenBlacklist.includes(userAuth.token)==true  || 
    tokenVerification(userAuth.token)=="error"  )
    {
//SE token NON VALIDO OPPURE NON PRESENTE NEL COOKIE

      //se il carrello non è presente nel cookie allora lo devo creare 
      if ( userAuth.sessionCart === undefined) {
        //e passo cod 2 
        req.result = 2;
        next();}
        //Se il carrello ci sta allora semplicemente cod 3
        else{ req.result = 3; next(); }
  }
  
  //NEL CASO IN CUI IL TOKEN C'è ED é VALIDO
else{ req.result = 1;
  next();}

}
} catch (error) {
  if (error instanceof jwt.JsonWebTokenError) {
    }
}

}};



module.exports = controlTokenAndSessionCart;