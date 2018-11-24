const {Pool} = require('pg');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 9888

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/todo', todo)
  /*.get('/login', login)*/
  /*.set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))*/
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

function todo() {
}

function login() {

}

function loginPage() {

}