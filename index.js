const {Pool} = require('pg');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 9888

const bodyParser = require('body-parser')
const htmlParser = bodyParser.text({ type: 'text/html' })

var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

/*let dom = new (require('jsdom').JSDOM)(htmlString);
let $ = require('jquery')(dom.window);*/

var $ = jQuery = require('jquery')(window);

express()
  .use(express.static(path.join(__dirname, 'public')))
  //.use(bodyParser.text({ type: 'text/html' }))
  .use(bodyParser.urlencoded({ extended: true }))
  .get('/toDoDate', toDoDate)
  .get('/toDoDateSpan', toDoDateSpan)
  .get('/toDoId', toDoId)
  .get('/addToDoItem', addToDoItem)
  /*.get('/login', login)*/
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/list'))
  .get('/login', function (req, res) {
      //res.send(req.body.topContent)
      res.render('pages/login')
  })
  .get('/list', (req, res) => res.render('pages/list'))
  .post('/list', toDoList)
  .get('/toDoItem', (req, res) => res.render('pages/to_do_item'))
  .get('/addItem', (req, res) => res.render('pages/add_item'))
  .get('/editItem', (req, res) => res.render('pages/edit_item'))
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
        pool.query('SELECT id, thing_to_do, notes, to_char(date_to_start, \'YYYY/MM/DD\' :: text) AS date_to_start, to_char(date_to_be_done, \'YYYY/MM/DD\' :: text) AS date_to_be_done FROM to_do_item WHERE (date_to_start >= date \'' + request.query.date_to_start + '\' AND date_to_start <= date \'' + request.query.date_to_be_done + '\') OR (date_to_be_done >= date \'' + request.query.date_to_start + '\' AND date_to_be_done <= date \'' + request.query.date_to_be_done + '\')  ORDER BY date_to_start ASC', (err, res) => {
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

function addToDoItem (request, response) {
    var errorMessage
    if (typeof(request.query.thing_to_do) !== "undefined") {
        console.log("Thing to do: " + request.query.thing_to_do)
        /*
        INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done)
        VALUES (1, 'Complete Week 12 Prove assignment', 'Finish client-side interaction', '2018-12-06', '2018-12-08');
        */
        const insertQuery = 'INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done) VALUES (1, \'' + request.query.thing_to_do + '\', \'' + request.query.notes + '\', \'' + request.query.date_to_start + '\', \'' + request.query.date_to_be_done + '\')'
        const qText = 'INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done) VALUES ($1, $2, $3, $4, $5)'
        const qValues = [1, request.query.thing_to_do, request.query.notes, request.query.date_to_start, request.query.date_to_be_done]
        console.log('Insert query:' + insertQuery)
        pool.query(qText, qValues, (err, res) => {
            if (err) {
                console.log(err.stack)
                errorMessage = 'Add failed'
                console.log(errorMessage)
            }
            else {
                console.log(res.rows[0])
                //return res
            }
        })
    } else {
        errorMessage = 'Insufficient data provided'
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


/*$("#selectId").submit(function(e) {
    e.preventDefault()*/
    /*const target = "/toDoId?id=" + $("#toDoId").val() //get to-do item ID from form
    console.log(target)*/
    /*$.get(target, function (response) {
        console.log(JSON.stringify(response))
    }).fail(function () {
        //output error message
    })
})*/

/*$("#buttonItemId").click(function() {
$("p").hide()
})*/

function retrieveToDoItemId (selectedId) {
    console.log(selectedId)
    pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + selectedId, (err, res) => {
        if (res.rows.length !== 0) {
            console.log(JSON.stringify(res.rows))
            return response.json(res.rows)
        }
        else {
            errorMessage = 'No match found for ID given'
            console.log(errorMessage)
        }
    })
    /*const target = "/toDoId?id=" + $("#toDoId").val() //get to-do item ID from form
    console.log(target)*/
}

function toDoList (request, response, next) {
    //res.render('partials/list')
    const selectedId = request.body.toDoId
    const toDoIdJquery = $("#toDoId").val()
    console.log("To-Do ID: " + request.body.toDoId)
    console.log("To-Do ID (jQuery: " + toDoIdJquery)
    var data = { id: selectedId }
    console.log(data)
    //retrieveToDoItemId(toDoId)
    pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + selectedId, (err, res) => {
        if (res.rows.length !== 0) {
            console.log(JSON.stringify(res.rows))
            /*for (var i = 0; i < res.rows.length; ++i) {
                const
            }
            res.render('pages/toDoItem', {
                weight: weight,
                weightUnit: weightUnit,
                mailType: mailType,
                postage: postage
            });*/
            //return response.json(res.rows)
            //request.body.to_do_list_results.innerHTML += JSON.stringify(res.rows)
        }
        else {
            errorMessage = 'No match found for ID given'
            console.log(errorMessage)
            console.log(err)
        }
    })
/*function toDoList () {
    $("#selectId").submit(function(e) {
        e.preventDefault()
        var data
        $.post('/list', data, function(resp) {
            console.log(resp)
        })
    })*/
    /*const target = "/toDoId?id=" + req.body.toDoId //get to-do item ID from form
    console.log(target)
    res.redirect(target)*/
}

function displayToDoItems () {
}


/*
References

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

https://www.sitepoint.com/testing-for-empty-values/
SitePoint - Test for Empty Values in Javascript

https://www.tutorialspoint.com/nodejs/nodejs_response_object.htm
TutorialsPoint - Node.js - Response Object

https://stackoverflow.com/questions/1801160/can-i-use-jquery-with-node-js
Stack Overflow - Can I use jQuery with Node.js?

https://stackoverflow.com/questions/36206919/how-do-i-access-ejs-data-in-a-form-while-using-express
Stack Overflow - How do i access ejs data in a form while using express

https://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
Stack Overflow - How do you extract POST data in Node.js?

https://stackoverflow.com/questions/19035373/how-do-i-redirect-in-expressjs-while-passing-some-context
Stack Overflow - How do I redirect in expressjs while passing some context?

https://codeburst.io/explaining-value-vs-reference-in-javascript-647a975e12a0
Explaining Value vs. Reference in Javascript
[Syntax for a putting the value of a variable in a JSON object]

https://stackoverflow.com/questions/10318294/js-dom-equivalent-for-jquery-append
Stack Overflow - JS DOM equivalent for JQuery append

https://stackoverflow.com/questions/17378199/uncaught-referenceerror-function-is-not-defined-with-onclick
Uncaught ReferenceError: function is not defined with onclick

https://node-postgres.com/features/queries
Node-Postgres - Queries - Parameterized query
 */