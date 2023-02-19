const User = require("../models/user");
const { sendError } = require("../utils/helper");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//la blacklist contenente i token non più validi , ovvero quelli delle persone che hanno fatto il logout
const tokenBlacklist = [];
module.exports.tokenBlacklist = tokenBlacklist;

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

//queste 2 righe servono per salvare sul database l'id dell'utente ed il token 
  req.session.token = token;
  req.session.userId = _id; 
  await req.session.save();

  res.json({token:token , user:_id});
} catch (error) {
  console.log(error);
  res.json({error:error});
}
};




//distruggo la sessione sul database, il cookie e poi aggiungo il token dell'utente che ha fatto il logout nella blacklist
  exports.logout = async (req, res) => {
    try{
    const userAuth = JSON.parse(req.cookies.auth);
     req.session.destroy();
      console.log({ ok:"database session broken"});  
      // Elimina il cookie "myCookie"
     res.clearCookie("auth");
      console.log("auth cookie destroyed"); 
      tokenBlacklist.push(userAuth.token);
      console.log({ ok:"token added to blacklist"}); 
      res.json({ok:"token added to blacklist"});
    }
    catch (error) {
       console.log(error);
      res.json({error:error});
    }
  };



  exports.authenticatedOrNot = (req, res) => {
    try{
      console.log(req.result);
      
      res.json(req.result);
    }
    catch (error) {
      res.json({error:error});
    }
  };

  exports.getUserInformations = async (req, res) => {
    try{
      const userAuth = await JSON.parse(req.cookies.auth);
      const userId = userAuth.userId;
  
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      res.json(user);
    }
    catch (error) {
       console.log(error);
      res.json({error:error});
    }
  };




// Configura il modulo nodemailer per inviare email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'niccolo99cacace@gmail.com', // Inserisci il tuo indirizzo email
    pass: 'pqluclhysbdukrsd' // Inserisci la tua password
  }
});
  


exports.sendResetPasswordMailAndToken = async (req, res) => {
 
  try{
    const { email, userId } = req.body;
    console.log(email);
    console.log(userId);
  // Cerca l'utente nel database utilizzando l'email fornita nella richiesta
  //viene restituito uno user o err nella funzione di callback
   User.findOne({ email: email }, (err, user) => {
    //Questa condizione controlla se la variabile err esiste oppure se la variabile user è null o undefined.
    if (err || !user) {
      // Se l'utente non è stato trovato, invia una risposta con errore
      console.log("Utente non trovato")
      return res.status(400).json({ message: 'Utente non trovato.' });
    } else {
      // Genera un token di reset password utilizzando json web token
      //GENERO QUESTO TOKEN METTENDOCI DENTRO L'ID DELL'UTENTE 
      const token = jwt.sign({ _id: userId }, process.env.JTW_TOKEN_SIGNATURE, { expiresIn: '15m' });

      // Aggiorna il campo resetPasswordToken del documento utente con il token appena generato
      //viene restituito uno user o err nella funzione di callback
      User.findOneAndUpdate({ email: email }, { resetPasswordToken: token }, { new: true }, (err, user) => {
        if (err) {
          console.log("Errore nella memorizzazione del resetPasswordToken nel database")
      return res.status(400).json({ message: 'Errore nella memorizzazione del resetPasswordToken nel database' });
        } else {
          // Invia un'email all'utente con il link per resettare la password
          const mailOptions = {
            from: 'niccolo99cacace@gmail.com', // Inserisci il tuo indirizzo email
            to: email,
            subject: 'Reset Password',
            html: `<p>Ciao ,</p><p>Per resettare la tua password, clicca sul seguente link:</p>http://localhost:8000/api/user/LinkResetPassword/${token}<p></p><p>Il link scadrà in 15 minuti.</p>`
          };
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.log("c'è stato un errore durante l'invio dell'email");
              console.log(err);
              return res.status(400).json({ message: "c'è stato un errore durante l'invio dell'email" });
            } else {
              // Invia una risposta al client confermando l'invio dell'email
              res.status(200).json({ message: 'Un link per il reset della password è stato inviato alla tua email.' });
            }
          });
        }

      });
    }
  });
}
catch (error) {
   console.log(error);
  res.json({error:error});
}
};


//${process.env.CLIENT_URL}/reset-password/${token}


/* questo metodo viene avviato quando l'utente preme sul link che gli abbiamo inviato per resettare la password . 
Controlliamo che il resetPasswordToken che ci ha inviato tramite url sia corretto , se corretto lo rendirizziamo 
alla pagina che gli permetterà di resettare la password.
(IL TOKEN CONTIENE L'id dell'utente , quindi io trovo l'utente nel database solo grazie al token)
(dopo , all'avvio della nuova password verrà , ocn un altro metodo, fatto un altro controllo del resetPasswordToken)  */ 
exports.LinkResetPassword = async (req, res) => {
 
  try{

    
    const token = req.params.token;
    console.log(token);
// Decodifica il token di reset password utilizzando json web token
jwt.verify(token , process.env.JTW_TOKEN_SIGNATURE, (err, decodedToken) => {
  if (err) {
    // Se il token non è valido, errore
    console.log("TOKEN RESET PASSWORD NON VALIDO");
              return res.status(400).json({ message: "TOKEN RESET PASSWORD NON VALIDO" });
  } else {
    // Cerca l'utente nel database utilizzando l'ID contenuto nel token 
    //il token contiene l'id dell'utente
    User.findById(decodedToken._id, (err, user) => {
      if (err || !user) {
        // Se l'utente non è stato trovato, reindirizza l'utente a una pagina di errore
        console.log("UTENTE NON TROVATO CON IL RESET TOKEN USATO");
              return res.status(400).json({ message: "UTENTE NON TROVATO CON IL RESET TOKEN USATO" });
      } else {
        // Mostra un modulo all'utente per la modifica della password
        res.redirect(`http://localhost:3000/reset-password/${token}`);
      }
    });
  }
}
)
  }
catch (error) {
  console.log(error);
  res.json({error:error});
}
};





exports.ConfirmResetPassword = async (req, res) => {
 
  try{
     
    const { newPassword, token } = req.body;

  // Decodifica il token di reset password utilizzando json web token
  jwt.verify(token, process.env.JTW_TOKEN_SIGNATURE, (err, decodedToken) => {
    if (err) {
      // Se il token non è valido
      console.log("RESET PASSWORD TOKEN USATO NON VALIDO");
      return res.status(400).json({ message: "RESET PASSWORD TOKEN USATO NON VALIDO" });
    } else {
      // Cerca l'utente nel database utilizzando l'ID contenuto nel token
      User.findById(decodedToken._id, (err, user) => {
        if (err || !user) {
          // Se l'utente non è stato trovato, reindirizza l'utente a una pagina di errore
          console.log("L'UTENTE CERCATO IN BASE AL RESET PASSWORD TOKEN NON è STATO TROVATO");
      return res.status(400).json({ message: "L'UTENTE CERCATO IN BASE AL RESET PASSWORD TOKEN NON è STATO TROVATO" });
        } else {
          // Controlla se la nuova password è valida
          if (newPassword.newPassword === '') {
            // Se la password non è stata fornita, mostra un messaggio di errore all'utente
            console.log("IL CAMPO NEWPASSWORD é VUOTO");
            return res.status(400).json({ message: "IL CAMPO NEWPASSWORD é VUOTO" });
          } else {
            // Aggiorna la password dell'utente nel database e azzeri il campo resetToken
            user.password = newPassword.newPassword;
            user.resetPasswordToken = '';
            user.save((err, updatedUser) => {
              if (err) {
                // Gestisci l'errore
                console.log("ERRORE DURANTE IL CARICAMENTO DELLA NUOVA PASSWORD NEL DATABASE");
                console.log(err);
                return res.status(400).json({ message: "ERRORE DURANTE IL CARICAMENTO DELLA NUOVA PASSWORD NEL DATABASE" });
              } else {
                // tutto corretto e torno al login 
                res.redirect("http://localhost:3000/login");
              }
            });
          }
        }
      })
          }
        })
      }
        catch (error) {
           console.log(error);
          res.json({error:error});
        }
        };
                