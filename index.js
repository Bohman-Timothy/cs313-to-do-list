const {Pool} = require('pg');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 9888

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/toDoDate', toDoDate)
  .get('/toDoDateSpan', toDoDateSpan)
  .get('/toDoId', toDoId)
  /*.get('/login', login)*/
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/login', function (req, res) {
      //res.send(req.body.topContent)
      res.render('pages/login')
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

function toDoDate (request, response) {
    var errorMessage
    if (typeof(request.query.date_to_start) !== "undefined") {
        console.log("Date to Start: " + request.query.date_to_start)
        pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE date_to_start= date \'' + request.query.date_to_start + '\'', (err, res) => {
            if (res != "undefined") {
                if (res.rows.length !== 0) {
                    console.log(JSON.stringify(res.rows))
                    return response.json(res.rows)
                }
                else {
                    errorMessage = 'No match found for date_to_start'
                    console.log(errorMessage)
                }
            }
            else {
                errorMessage = 'Error: res is undefined'
                console.log(errorMessage)
            }
        })
    }
    else if (typeof(request.query.date_to_be_done) !== "undefined") {
        console.log("Date to Be Done: " + request.query.date_to_be_done)
        pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE date_to_be_done = date \'' + request.query.date_to_be_done + '\'', (err, res) => {
            if (res.rows.length !== 0) {
                console.log(JSON.stringify(res.rows))
                return response.json(res.rows)
            }
            else {
                errorMessage = 'No match found for date_to_be_done'
                console.log(errorMessage)
            }
        })
    }
    else {
        errorMessage = 'No date given'
        console.log(errorMessage)
    }
    if (errorMessage) {
        return response.send('<p>See log for error message</p>')
    }
}

function toDoDateSpan (request, response) {
    var errorMessage
    if ((typeof(request.query.date_to_start) !== "undefined") && (typeof(request.query.date_to_be_done) !== "undefined")) {
        console.log("Date to Start: " + request.query.date_to_start)
        console.log("Date to Be Done: " + request.query.date_to_be_done)
        pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE (date_to_start >= date \'' + request.query.date_to_start + '\' AND date_to_start <= date \'' + request.query.date_to_be_done + '\') OR (date_to_be_done >= date \'' + request.query.date_to_start + '\' AND date_to_be_done <= date \'' + request.query.date_to_be_done + '\')', (err, res) => {
            if (res.rows.length !== 0) {
                console.log(JSON.stringify(res.rows))
                return response.json(res.rows)
            }
            else {
                errorMessage = 'No match found for date span given'
                console.log(errorMessage)
            }
        })
    } else {
        errorMessage = 'No date given'
        console.log(errorMessage)
    }
    if (errorMessage) {
        return response.send('<p>See log for error message</p>')
    }
}

function toDoId (request, response) {
    var errorMessage
    if (typeof(request.query.id) !== "undefined") {
        console.log("ID: " + request.query.id)
        pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + request.query.id, (err, res) => {
            if (res.rows.length !== 0) {
                console.log(JSON.stringify(res.rows))
                return response.json(res.rows)
            }
            else {
                errorMessage = 'No match found for ID given'
                console.log(errorMessage)
            }
        })
    } else {
        errorMessage = 'No ID given'
        console.log(errorMessage)
    }
    if (errorMessage) {
        return response.send('<p>See log for error message</p>')
    }
}

function login() {

}

function loginForm() {

}

/*
https://www.freecodecamp.org/forum/t/nodejs-trying-to-get-button-to-navigate-to-other-page-in-folder-structure/160941
Freecodecamp - Nodejs trying to get button to navigate to other page in folder structure

https://stackoverflow.com/questions/44251142/ejs-dynamic-include
Stack Overflow - EJS dynamic include

https://www.plus2net.com/html_tutorial/button-linking.php
plus2net - Linking pages using buttons click event

https://www.postgresql.org/docs/10/functions-datetime.html
Documentation → PostgreSQL 10 - 9.9. Date/Time Functions and Operators - Chapter 9. Functions and Operators

http://www.informit.com/articles/article.aspx?p=24123&seqNum=4
informit - Passing Data with Form and URL Variables
 */