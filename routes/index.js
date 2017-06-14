var express = require('express');
var router = express.Router();

var levelup = require('level');
var db = levelup('./answers.db');

var bodyParser = require('body-parser');

var tableBuilder = require('../public/javascripts/tablegen.js');

var QUIZ_NAME_KEY = 'quizName';
var TABLE_KEY = 'table';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { tableHeader : '↖ Select a file!', tableData : '' });
});

router.post('/tables', function(req, res, next) {
    var id = req.body[QUIZ_NAME_KEY];
    // replace invalid url chars    
    id = id.replace(/[^a-zA-Z0-9-_]/g, '');
    
    var toStore = JSON.stringify(req.body);
    db.put(id, toStore, function(err) {
        if(err) return console.log('Error putting ' + id, err);
        
        console.log("successfully stored " + id);
        var newUrl = '/tables/' + id;
        res.send({ redirect : newUrl });
    });
});

router.get('/tables/:tableName', function(req, res, next) {
    return getTableById(req.params.tableName, res);    
});

/**
 * Returns the full HTML page with the table corresponding to the given tableId.
 */
function getTableById(tableId, res) {
    console.log('getTableById ' + tableId);
    db.get(tableId, function(err, value) {
        if(err) {
            // TODO should go to 404
            console.log(err);
            res.send("No table named " + tableId + ".");
        }
        
        // Turn the stored string back into json, and get the data from it
        var quizJson = JSON.parse(value);
        var quizName = quizJson[QUIZ_NAME_KEY];
        var tableArray = [];
        
        for(var x in quizJson) {
            if(x.startsWith(TABLE_KEY)) {
                tableArray.push(quizJson[x]);
            }
        }
        
        var tableHtml = tableBuilder.buildTable(tableArray);
        // Render the page, replace the table with the one we've generated,
        // and sent it to the client
        return res.render('index', { tableHeader : quizName, tableData : tableHtml });        
    });
}

module.exports = router;
