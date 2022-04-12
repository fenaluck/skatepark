//* importamos las libreria pg
const { Pool } = require('pg')

//* creamos nuestro pool de conexiones
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'skatepark',
  password: '',
  max: 12,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

//? Consulta de un usuario por su email, o undefined si este no existe en la tabla "skaters" */
async function get_user(email) {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from skaters where email=$1',
    values: [email]
  })

  client.release()

  if (rows.length > 0) {
    return rows[0]
  }
  return undefined
}

//? Consulta de usuarios ordenados por id
async function get_users() {
  const client = await pool.connect()

  const { rows } = await client.query('select * from skaters order by id')

  client.release()

  return rows
}

//?consulta para crear usuarios
async function create_user(email, name, password, years_exp, especialidad, foto, estado) {
  const client = await pool.connect()

  await client.query({
    text: 'insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado ) values ($1, $2, $3, $4, $5, $6, $7)',
    values: [email, name, password, years_exp, especialidad, foto, true]
  })

  client.release()
}

//? Cambiar estado del usuario
async function set_estado(user_id, new_estado) {
  const client = await pool.connect()

  await client.query({
    text: 'update skaters set estado=$2 where id=$1',
    values: [parseInt(user_id), new_estado]
  })

  client.release()
}

//? actualiza datos del usuario
async function update_user(email, name, password, anos_experiencia, especialidad) {
  const client = await pool.connect()
  
  const { rows } = await client.query({
    text:'update skaters set nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 where email=$1',
    values:[email, name, password, anos_experiencia, especialidad]
  })
  
  client.release()
  
  return rows
}

//! elimina usuario
async function delete_user(email) {
  const client = await pool.connect()

  const { rows } = await client.query({
    text:'delete from skaters where email=$1',
    values:[email]
  })

  client.release()

  return rows
}

//* Exportamos las funciones
module.exports = {
  get_user,
  get_users,
  create_user,
  set_estado,
  update_user,
  delete_user
}
