const express = require("express");
require("express-async-errors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const morgan = require("morgan");
const { errorHandler } = require("./middlewares/error");
require("dotenv").config();
require("./db");
const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");
const cors = require('cors'); 


const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
const cookieParser = require('cookie-parser');

app.use(cookieParser());




app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
})); 




const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "mySessions",
  });
    

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      //se a true vuol dire che il cookie viene inviato solo se la connessione è sicura (solo con HTTPS)
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 settimana
    },
//store per sapere dove è salvata la sessione(sopra abbiamo la var store)
    store: store,
   
  })
);


app.use("/api/item", itemRouter);
app.use("/api/user", userRouter);


app.listen(8000, () => { 
  console.log("the port is listening on port 8000");
});
