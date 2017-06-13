var express = require('express');
var router = express.Router();

var levelup = require('level');
var db = levelup('./answers.db');

var SillyId = require('sillyid');
var sid_gen = new SillyId();

var bodyParser = require('body-parser');

var tableBuilder = require('../public/javascripts/tablegen.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/answersets', function(req, res, next) {
    var id = sid_gen.generate();
    
    // For some reason, the data I want is the first key in the json.
    // This is done by the requesting code, or something.
    var body = '';
    for(var key in req.body) {
        if(body) {
            console.log('Request body was bigger than expected!');
        }
        body += key;
    }    
    
    body = JSON.stringify(body);
    db.put(id, body, function(err) {
        if(err) return console.log('Error putting ' + id, err);
        
        console.log("successfully stored " + id);
    });
    res.status(201).redirect('/answersets/'+id);
});

router.get('/answersets/:setId', function(req, res, next) {
    db.get(req.params.setId, function(err, value) {
        if(err) {
            // TODO test that this goes to 404 handler
            next(err);
        }
    
        // "Convert" the raw string to a recognizable 2d array format
        // Remove quotes at start and end
        value = value.substr(1, value.length - 2);
        // Replace all escaped quotes with regular ones
        value = value.replace(/\\"/g, '"');
        // Assemble the actual array, now that we have parseable json
        var tableArray = JSON.parse(value);
        
        var tableHtml = tableBuilder.buildTable(tableArray);        
        
        // Render the page, replace the table with the one we've generated,
        // and sent it to the client
        res.render('index', function(err, html) {
            if(err) next(err);
            
            var tableDiv = '"table-div">';
            var insertIndex = html.lastIndexOf(tableDiv) + tableDiv.length;
            // Put the tableHtml into the table-div
            html = html.substr(0, insertIndex) + tableHtml + 
                html.substr(insertIndex, html.length);
            
            res.send(html);
        });
        
    });
});

module.exports = router;
