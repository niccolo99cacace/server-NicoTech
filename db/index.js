const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGO_URI, {
    //tutte cose messe per correggere gli avvisi di deprecazione(utilizzo di nuovi protocolli)
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db is connected!");
  })
  .catch((ex) => {
    console.log("db connection failed: ", ex);  
  });
