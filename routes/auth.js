const express = require('express')
const bcrypt = require('bcrypt')
const nunjucks = require('nunjucks')
const { get_user, create_user } = require('../db.js')
const router = express.Router()
const session = require('express-session');
const flash = require('connect-flash');
router.use(flash());

// Rutas de Auth (externas)
router.get('/login', (req, res) => {
  const errors = req.flash('errors')
  res.render('login.html', { errors })
});


router.post('/login', async (req, res) => {
  // 1. Recuperar los valores del formulario
  console.log(req.body)
  const email = req.body.email
  const password = req.body.password

  // 2. Validar  que usuario sí existe
  const user = await get_user(email)
  if (!user) {
    req.flash('errors', 'Usuario no existe o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 3. Validar que contraseña coincida con lo de la base de datos
  const comparar = await bcrypt.compare(password, user.password)
  if ( !comparar ) {
    req.flash('errors', 'Usuario no existe o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 4. Guardamos el usuario en sesión
  req.session.user = user
  res.redirect('/')
});

router.get('/register', (req, res) => {
  const errors = req.flash('errors')
  res.render('register.html', { errors })
});

router.post('/register', async (req, res) => {
  // 1. Recuperamos los valores del formulario
  const email = req.body.email
  const name = req.body.name
  const password = req.body.password
  const pass_ok = req.body.pass_ok
  const years_exp = req.body.anos_exp
  const especialidad = req.body.especialidad
  const foto = req.files.foto.name
  const estado = req.body.estado
  const imagen = req.files.foto
  const arbol = req.files.foto.name.split('.').slice(-1).pop();


  console.log(`mira aqui`, arbol)
  //extraer la extesion de la foto
  const ext = foto.split('.').slice(-1).pop().toLowerCase();
  //validar la extension
  if(
      ext != 'jpg' &&
      ext != 'png' &&
      ext != 'jpeg' && 
      ext != 'bmp'
    ) 
    {
      req.flash('errors', 'La extesion del archivo no esta permitida')
      return  res.redirect('/register');
    }
  
  // 2. validar contraseña
  if (password != pass_ok) {
    req.flash('errors', 'La contraseñas no coinciden')
    return res.redirect('/register')
  }
  // 3. validar que email no exista previamente
  const user = await get_user(email)
  if (user) {
    req.flash('errors', 'Usuario ya existe o contraseña incorrecta')
    return res.redirect('/register')
  }
  // 4. encriptamos el password
  const encrypt_pass = await bcrypt.hash(password, 10)
  // 5. creamos el nuevo usuario en la base de datos
  await create_user(email, name, encrypt_pass, parseInt(years_exp), especialidad, foto.name, estado)
  // 6. guardamos la imagen 
  await imagen.mv(`static/img/${foto.name}`)
  // 7. Guardo el nuevo usuario en sesión
  req.session.user = {email, name, encrypt_pass, years_exp, especialidad, foto, estado }
  res.redirect('/login')
});

module.exports = router

