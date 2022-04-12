const express = require('express')
const bcrypt = require('bcrypt')
const nunjucks = require('nunjucks')
const { get_users, set_estado, get_user, delete_user, update_user } = require('../db.js')
const router = express.Router()
const session = require('express-session');

// Rutas internas
function protected_routes (req, res, next) {
  if (!req.session.user) {
    req.flash('errors', 'Debe ingresar al sistema primero')
    //return res.redirect('/login')
  }
  next()
}

router.get('/', protected_routes, async(req, res) => {
  const user = req.session.user
  const users = await get_users()

  res.render('index.html', { user, users })
});

router.get('/datos', protected_routes, async(req, res) => {
  const user = req.session.user
  console.log(user)
  res.render('datos.html', { user })
});

router.get('/admin', protected_routes, async (req, res) => {
  const user = req.session.user
  // me traigo a lista de todos los usuarios
  const users = await get_users()

  res.render('admin.html', { user, users })
});

router.get('/login', protected_routes, async(req, res) => {
  const errors = req.flash('errors')
  res.render('login.html', { errors })
});


router.get('/logout', (req, res) => {
  // 1. Eliminamos al usuario de la sesión
  req.session.user = undefined
  // 2. Lo mandamos al formulario de login
  res.redirect('/login')
})

router.post('/datos', protected_routes, async(req, res) => {
  
  const email = await req.session.user;
  const name = req.body.nombre;
  const password = req.body.password;
  const pass_ok = req.body.password_confirm;
  const anos_exp = req.body.anos_experiencia;
  const especialidad = req.body.especialidad;
  console.log(email)
  console.log(name)
  console.log(password, anos_exp, especialidad, pass_ok)
  console.log(req.session.user)

  const user = await get_user(email);
  if (!user) {
      req.flash('errors', 'Usuario no existe o contraseña incorrecta');
      return res.redirect('/login');
  }

  if (password != password_confirm) {
      req.flash('errors', 'Usuario no existe o contraseña incorrecta');
      return res.redirect('/login');
  }

  const password_encrypt = await bcrypt.hash(password, 10)
  await update(email, name, password, parseInt(anos_experiencia), especialidad);
  req.session.user = { email, nombre: name, anos_experiencia, especialidad }
  
  res.redirect('/');
  
});

router.put('/users/:id', async (req, res) => {
  console.log(req.params);
  console.log(req.body);

  await set_estado(req.params.id, req.body.new_estado)

  res.json({todo: 'ok'})
})

router.get('/eliminar', async(req, res) => {
  // 1. traemos los datos para eliminar el usuario en este caso el email
  const email =  req.session.user
 
  // 2. llamamos a la funcion de borrar y le incorporamos el parametro del email
  await delete_user(email)
  res.redirect('/login')
})

module.exports = router