// 1. Importa las librerías que vamos a utilizar
const express = require('express')
const fileupload = require('express-fileupload')
const session = require('express-session')
const nunjucks = require('nunjucks')
const flash = require('connect-flash')
const PORT = 3000
const app = express()

// 2. Configura las librerías
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('static'))
app.use(flash())

//* configuracion nunjucks
nunjucks.configure('templates',{
  express:app,
  autoscape:true,
  noCache:false,
  watch:true
});

//* configuracion session
app.use(session({
  secret: "mi-clave",
  saveUninitialized:true,
  cookie: { maxAge: 60*60*1000*24 }, 
  resave: false
}));

//* configuracion fileupload
app.use(fileupload({
  limits: { fileSize: 5242880 },
  abortOnLimit: true,
  responseOnLimit: 'El archivo supera el peso máximo (5Mb)'
}))

// 3. Importa las rutas
app.use(require('./routes/auth.js'))
app.use(require('./routes/routes.js'))

// 4. Inicia el Servidor
app.listen(PORT, () => console.log(`Servidor en el puerto ${PORT}`));

