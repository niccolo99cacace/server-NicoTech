
//utilizzando sendError , viene creato un messaggio di errore con il messaggio inserito come parametro 
//questo verrà inglobato in un oggetto con chiave "error" con stato 401 ( accesso risorsa negata)
//ovviamente , come è evidente , possiamo modificare anche il valore dello stato inserendolo 
//terzo parametro (il primo parametro deve essere SEMPRE la risposta res , poi il messaggio di errore e infine lo stato)
exports.sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error });
};
