const {Pool} = require('pg');
const express = require('express')
const path = require('path')
const session = require('express-session')
const bcrypt = require('bcrypt')
const PORT = process.env.PORT || 9888

/*const bodyParser = require('body-parser')
const htmlParser = bodyParser.text({ type: 'text/html' })

var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;*/

/*let dom = new (require('jsdom').JSDOM)(htmlString);
let $ = require('jquery')(dom.window);*/

//var $ = jQuery = require('jquery')(window);

const saltRounds = 10

express()
  .use(express.static(path.join(__dirname, 'public')))
  //.use(bodyParser.text({ type: 'text/html' }))
  //.use(bodyParser.urlencoded({ extended: true }))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(session({
      secret: 'pencils down',
      resave: false,
      saveUninitialized: false
  }))
  .get('/toDoDate', toDoDate)
  .get('/toDoDateSpan', toDoDateSpan)
  .get('/toDoDateSpanUser', toDoDateSpanUser)
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
  .post('/login', login)
  .post('/logout', logout)
  .get('/list', (req, res) => res.render('pages/list'))
  //.post('/list', toDoList)  //Requires bodyParser and/or htmlParser to work
  .get('/toDoItem', (req, res) => res.render('pages/to_do_item'))
  .get('/addItem', (req, res) => res.render('pages/add_item'))
  .get('/editItem', editItemGet)
  .post('/editItem', editItem)
  .get('/editToDoItem', editToDoItem)
  .get('/deleteItem', deleteItem)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

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
                if (err) {
                    console.log(err.stack)
                    errorMessage = 'No match found for date_to_start'
                    console.log(errorMessage)
                } else if (res.rows) {
                    console.log(JSON.stringify(res.rows))
                    return response.json(res.rows)
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
            if (err) {
                console.log(err.stack)
                errorMessage = 'No match found for date_to_be_done'
                console.log(errorMessage)
            } else if (res.rows) {
                console.log(JSON.stringify(res.rows))
                return response.json(res.rows)
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
            if (err) {
                console.log(err.stack)
                errorMessage = 'No match found for date span given'
                console.log(errorMessage)
            } else if (res.rows) {
                console.log(JSON.stringify(res.rows))
                return response.json(res.rows)
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

function toDoDateSpanUser (request, response) {
    sess = request.session
    var errorMessage
    if (typeof(sess.userId) !== "undefined") {
        if ((typeof(request.query.date_to_start) !== "undefined") && (typeof(request.query.date_to_be_done) !== "undefined")) {
            console.log("Date to Start: " + request.query.date_to_start)
            console.log("Date to Be Done: " + request.query.date_to_be_done)
            console.log("User ID: " + request.session.userId)
            pool.query('SELECT id, thing_to_do, notes, to_char(date_to_start, \'YYYY/MM/DD\' :: text) AS date_to_start, to_char(date_to_be_done, \'YYYY/MM/DD\' :: text) AS date_to_be_done FROM to_do_item WHERE (((date_to_start >= date \'' + request.query.date_to_start + '\' AND date_to_start <= date \'' + request.query.date_to_be_done + '\') OR (date_to_be_done >= date \'' + request.query.date_to_start + '\' AND date_to_be_done <= date \'' + request.query.date_to_be_done + '\')) AND user_id_fk = ' + sess.userId + ') ORDER BY date_to_start ASC', (err, res) => {
                if (err) {
                    console.log(err.stack)
                    errorMessage = 'No match found for date span given'
                    console.log(errorMessage)
                    return response.send(errorMessage)
                } else if (res.rows) {
                    console.log(JSON.stringify(res.rows))
                    return response.json(res.rows)
                }
            })
        } else {
            errorMessage = 'No date given'
            console.log(errorMessage)
            return response.send(errorMessage)
        }
    } else {
        errorMessage = 'No user logged in'
        console.log(errorMessage)
        return response.send(errorMessage)
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
            if (err) {
                console.log(err.stack)
                errorMessage = 'No match found for ID given'
                console.log(errorMessage)
            } else if (res.rows) {
                console.log(JSON.stringify(res.rows))
                return response.json(res.rows)
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
    if (typeof(request.session.userId) !== "undefined") {
        if ((typeof(request.query.thing_to_do) !== "undefined") && (typeof(request.query.date_to_start) !== "undefined") && (typeof(request.query.date_to_be_done) !== "undefined")) {
            console.log("Thing to do: " + request.query.thing_to_do)
            const insertQuery = 'INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done) VALUES (1, \'' + request.query.thing_to_do + '\', \'' + request.query.notes + '\', \'' + request.query.date_to_start + '\', \'' + request.query.date_to_be_done + '\')  RETURNING id'
            const qText = 'INSERT INTO to_do_item (user_id_fk, thing_to_do, notes, date_to_start, date_to_be_done) VALUES ($1, $2, $3, $4, $5) RETURNING id, thing_to_do, notes, date_to_start, date_to_be_done'
            const qValues = [request.session.userId, request.query.thing_to_do, request.query.notes, request.query.date_to_start, request.query.date_to_be_done]
            console.log('Insert query: ' + insertQuery)
            pool.query(qText, qValues, (err, res) => {
                if (err) {
                    console.log(err.stack)
                    errorMessage = 'Add failed'
                    console.log(errorMessage)
                    return response.send({errorMessage : errorMessage})
                }
                else if (res.rows) {
                    console.log(res.rows[0])
                    return response.json(res.rows[0])
                }
            })
        } else {
            errorMessage = 'Insufficient data provided'
            console.log(errorMessage)
            return response.send({errorMessage : errorMessage})
        }
    } else {
        errorMessage = 'No user logged in'
        console.log(errorMessage)
        return response.send({errorMessage : errorMessage})
    }
    if (errorMessage) {
        return response.send('<p>See log for error message</p>')
    }
}

//Get data for a single to-do item and prepare that data to be placed within the edit item page's form; then render the /editItem page containing that data
function editItemGet (request, response) {
    var errorMessage
    var thing_to_do, date_to_start, date_to_be_done, notes
    if (typeof(request.query.id) !== "undefined") {
        console.log("ID: " + request.query.id)
        pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + request.query.id, (err, res) => {
            if (err) {
                console.log(err.stack)
                errorMessage = 'No match found for ID given'
                console.log(errorMessage)
            }
            else if (res.rows) {
                selectedItem = JSON.stringify(res.rows)
                console.log(selectedItem)
                id = res.rows[0]["id"]
                thing_to_do = res.rows[0]["thing_to_do"]
                date_to_start = res.rows[0]["date_to_start"].toISOString().
                    replace(/T.+/, '')
                date_to_be_done = res.rows[0]["date_to_be_done"].toISOString().
                    replace(/T.+/, '')
                notes = res.rows[0]["notes"]
                console.log(thing_to_do)
                console.log(date_to_start)
                console.log(date_to_be_done)
                console.log(notes)
                response.render('pages/edit_item', {
                    id: id,
                    thing_to_do: thing_to_do,
                    date_to_start: date_to_start,
                    date_to_be_done: date_to_be_done,
                    notes: notes
                });
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

//Get data (POST request) for a single to-do item and prepare that data to be placed within the edit item page's form; then render the /editItem page containing that data
function editItem (request, response) {
    var errorMessage
    var thing_to_do, date_to_start, date_to_be_done, notes
    const htmlPage = "pages/edit_item"
    //console.log(request.body)
    if (typeof(request.body.toDoId) !== "undefined") {
        console.log("ID: " + request.body.toDoId)
        pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + request.body.toDoId, (err, res) => {
            if (err) {
                console.log(err.stack)
                errorMessage = 'No match found for ID given'
                console.log(errorMessage)
            }
            else if (res.rows) {
                selectedItem = JSON.stringify(res.rows)
                console.log(selectedItem)
                id = res.rows[0]["id"]
                thing_to_do = res.rows[0]["thing_to_do"]
                date_to_start = res.rows[0]["date_to_start"].toISOString().
                replace(/T.+/, '')
                date_to_be_done = res.rows[0]["date_to_be_done"].toISOString().
                replace(/T.+/, '')
                notes = res.rows[0]["notes"]
                console.log(id)
                console.log(thing_to_do)
                console.log(date_to_start)
                console.log(date_to_be_done)
                console.log(notes)
                response.render('pages/edit_item', {
                    id: id,
                    thing_to_do: thing_to_do,
                    date_to_start: date_to_start,
                    date_to_be_done: date_to_be_done,
                    notes: notes
                })
                //response.send(htmlPage)
                /*, function (err, htmlPage) {
                    if (err) {
                        console.log(err)
                        errorMessage = "Failed to load Edit Item page"
                        console.log(errorMessage)
                        response.send(errorMessage)
                    } else {
                        console.log(htmlPage)
                        response.send(htmlPage)
                    }
                });*/

            }
        })
    } else {
        errorMessage = 'No ID given'
        console.log(errorMessage)
        response.send(errorMessage)
    }
    if (errorMessage) {
        return response.send('<p>See log for error message</p>')
    }
}

//Submit the query to edit an item with the values received in the request
function editToDoItem (request, response) {
    var errorMessage
    if (typeof(request.query.id) !== "undefined") {
        console.log("ID: " + request.query.id + " Thing to do: " + request.query.thing_to_do)
        const updateQuery = 'UPDATE to_do_item (thing_to_do, notes, date_to_start, date_to_be_done, date_modified) VALUES (\'' + request.query.thing_to_do + '\', \'' + request.query.notes + '\', \'' + request.query.date_to_start + '\', \'' + request.query.date_to_be_done + '\'' + ' \'now()\') WHERE id = ' + request.query.id + ';'
        const qText = 'UPDATE to_do_item SET thing_to_do = $1, notes = $2, date_to_start = $3, date_to_be_done = $4, date_modified = $5 WHERE id = $6 RETURNING thing_to_do'
        const qValues = [request.query.thing_to_do, request.query.notes, request.query.date_to_start, request.query.date_to_be_done, 'now()', request.query.id]
        console.log('Update query: ' + updateQuery)
        pool.query(qText, qValues, (err, res) => {
            if (err) {
                console.log(err.stack)
                errorMessage = 'Update failed'
                console.log(errorMessage)
                return response.send(errorMessage)
            }
            else if (res.rows) {
                console.log(res.rows[0])
                return response.send("success")
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

function deleteItem (request, response) {
    var errorMessage, successMessage
    if (typeof(request.query.id) !== "undefined") {
        console.log("ID: " + request.query.id)
        const deleteQuery = 'DELETE FROM to_do_item WHERE id = ' + request.query.id
        const qText = 'DELETE FROM to_do_item WHERE id = $1 RETURNING id = $1'
        const qValues = [request.query.id]
        console.log('Delete query: ' + deleteQuery)
        pool.query(qText, qValues, (err, res) => {
            if (err) {
                console.log(err.stack)
                errorMessage = 'Delete failed'
                console.log(errorMessage)
                return response.send(errorMessage)
            }
            else {
                successMessage = 'Successfully deleted ID: ' + request.query.id
                console.log(successMessage)
                return response.json(res.rows[0])
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

function login (req, res) {
    var loggedIn = false
    console.log('Logging in as: ' + req.body.username)
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        if (err) {
            console.log(err);
            res.send({loggedIn : loggedIn})
        } else {
            //console.log(hash);
        }
    });

    const userQuery = "SELECT id, password FROM to_do_list_user WHERE username='" + req.body.username + "'"
    qText = "SELECT id, password FROM to_do_list_user WHERE username = $1"
    qValues = [req.body.username]
    pool.query(qText, qValues, function (error, response) {
        if (error) {
            console.log(error)
            res.send({loggedIn : loggedIn})
        }
        else if (response.rows) {
            bcrypt.compare(req.body.password, response.rows[0].password, function (err, resp) {
                if (err) {
                    console.log(err)
                } else if (resp === true) {
                    req.session.username = req.body.username
                    req.session.userId = response.rows[0].id
                    console.log('Successfully logged in as session user: ' + req.session.username)
                    loggedIn = true
                }
                res.send({loggedIn : loggedIn})
            });
        }
        else {
            res.send({loggedIn : loggedIn})
        }
    });
}

function loginForm() {

}

function logout (req, res) {
    var loggedOut = false
    var alreadyLoggedOut = false
    if (req.session.username) {
        console.log('Logging out session user: ' + req.session.username)
        req.session.destroy(function (err) {})
        loggedOut = true
        console.log('Successfully logged out')
    } else {
        alreadyLoggedOut = true
    }
    res.send({loggedOut : loggedOut, alreadyLoggedOut : alreadyLoggedOut})
}

//Does NOT work. An attempt at using jQuery.
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

//Does NOT work. An attempt at using jQuery.
/*$("#buttonItemId").click(function() {
$("p").hide()
})*/

function retrieveToDoItemId (selectedId) {
    console.log(selectedId)
    pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + selectedId, (err, res) => {
        if (err) {
            console.log(err.stack)
            errorMessage = 'No match found for ID given'
            console.log(errorMessage)
        } else {
            console.log(JSON.stringify(res.rows))
            return response.json(res.rows)
        }
    })
    /*const target = "/toDoId?id=" + $("#toDoId").val() //get to-do item ID from form
    console.log(target)*/
}

//Retrieves just one item, according to ID given. Does work, but requires bodyParser and/or htmlParser, which are commented out near the beginning of this file. Also needs the form that is commented out on the /list page.
/*function toDoList (request, response, next) {
    //res.render('partials/list')
    const selectedId = request.body.toDoId
    const toDoIdJquery = $("#toDoId").val()
    console.log("To-Do ID: " + request.body.toDoId)
    console.log("To-Do ID (jQuery: " + toDoIdJquery)
    var data = { id: selectedId }
    console.log(data)
    //retrieveToDoItemId(toDoId)
    pool.query('SELECT id, thing_to_do, notes, date_to_start, date_to_be_done FROM to_do_item WHERE id = ' + selectedId, (err, res) => {
        if (err) {
            console.log(err.stack)
            errorMessage = 'No match found for ID given'
            console.log(errorMessage)
            console.log(err)
        }
        else {
            console.log(JSON.stringify(res.rows))
            return response.json(res.rows)
            //request.body.to_do_list_results.innerHTML += JSON.stringify(res.rows)
        }
    })
}*/

//Does NOT work. An attempt to utilize jQuery.
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
//}

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

https://www.w3schools.com/tags/tag_textarea.asp
W3Schools - HTML <textarea> Tag

https://stackoverflow.com/questions/10645994/how-to-format-a-utc-date-as-a-yyyy-mm-dd-hhmmss-string-using-nodejs
Stack Overflow - How to format a UTC date as a `YYYY-MM-DD hh:mm:ss` string using NodeJS?

https://www.w3schools.com/css/css_colors.asp
W3Schools - CSS Colors - Color Values

https://stackoverflow.com/questions/37243698/how-can-i-find-the-last-insert-id-with-node-js-and-postgresql
Stack Overflow - How can I find the last insert ID with Node.js and Postgresql?

https://stackoverflow.com/questions/503093/how-do-i-redirect-to-another-webpage
Stack Overflow - How do I redirect to another webpage? [JavaScript]

https://github.com/byui-cs/cs313-course/blob/master/week12/ta-solution/public/test.js
CS313 Week 12 Teacher's Solution - test.js

https://www.w3schools.com/tags/att_input_pattern.asp
W3Schools - HTML <input> pattern Attribute

https://www.w3schools.com/jquery/html_text.asp
W3Schools - jQuery text() Method [Note about using html() method instead]

https://stackoverflow.com/questions/36144081/res-render-not-rendering
Stack Overflow - Res.render() not rendering
 */