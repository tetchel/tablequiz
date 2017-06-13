var express = require('express');
var router = express.Router();

var levelup = require('level');
var db = levelup('./answers.db');

var SillyId = require('sillyid');
var sid_gen = new SillyId();

// "import" the client-side javascript code used to generate the table.
// there must be a better way
/*
var fs = require('fs');
var vm = require('vm');
var path = require('path');
var tablegen = fs.readFileSync(path.join(__dirname, '../public/javascripts/tablegen.js')).toString();
console.log(tablegen);
vm.runInNewContext(tablegen, context, )
*/
var tableBuilder = require('../public/javascripts/tablegen.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/answersets', function(req, res, next) {
    var id = sid_gen.generate();
    
    var body = JSON.stringify(req.body);
    db.put(id, body, function(err) {
        if(err) return console.log('Error putting ' + id, err);
        
        console.log("successfully stored " + id);
    });
    res.redirect('/answersets/'+id);
});

router.get('/answersets/:setId', function(req, res, next) {
    db.get(req.params.setId, function(err, value) {
        if(err) return console.log('Error retrieving ' + setId, err);
        
        value = JSON.parse(value);
        console.log(value);
        var tableHtml = tableBuilder.buildTable(value);
        console.log('now for the table:');
        console.log(tableHtml);
        //res.render('index');
        //return res.send(tableHtml);
    });
});



module.exports = router;
