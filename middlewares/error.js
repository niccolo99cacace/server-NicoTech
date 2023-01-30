/* è per gli errori di sistema , per quelli generici in cui ad esempio vogliamo avvertire l'utente 
che ha messo l'email sbagliata , usiamo sendError che abbiamo sviluppato nel package utils 

Il middleware "errorHandler" è utilizzato per gestire gli errori generati durante l'elaborazione 
della richiesta e assicurarsi che venga inviata una risposta appropriata al client. In questo modo, 
in caso di errori, si può evitare che l'applicazione si arresti e si può fornire una risposta
 significativa al client.
 */


exports.errorHandler = (err, req, res, next) => {
  res.status(500).json({ errro: err.message || err });
};
