const {Pool} = require('pg');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 9888

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/todo', todo)
  /*.get('/login', login)*/
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/login', (req, res) => res.render('pages/login'))
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

/*
https://www.freecodecamp.org/forum/t/nodejs-trying-to-get-button-to-navigate-to-other-page-in-folder-structure/160941
Freecodecamp - Nodejs trying to get button to navigate to other page in folder structure
 */