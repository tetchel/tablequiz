"use strict";

// The first index is the question # (zero-indexed), the second index 
// is the nth answer column corresponding to that question
var tableArray = [];

window.onbeforeunload = function() {
    /*if(!jQuery.isEmptyObject(tableArray)) {
        return "Are you sure you want to leave? Your current quiz will be lost!";
    }*/
    return;
}

function filePicked(files) {    
    var file = files[0], 
        reader = new FileReader();
    
    if(files.length > 1) {
        alert("Only upload one file at a time.");
        return;
    }
    
    if(!jQuery.isEmptyObject(tableArray)) {
        var conf = confirm('Your current quiz will be lost. ' + 
                           'Are you sure you wish to continue?');
        
        if(conf !== true) {
            return;
        }
    }
    
    console.log("Uploaded " + file.name + ", size: " + (file.size / 1024) + "kb");
    reader.readAsText(file, "UTF-8");
    
    reader.onload = function (e) {
        // For the duration of this function, busy the cursor
        $("body").css("cursor", "progress");
        
        $("#file-display").html(file.name).show();
        $("#score-display").empty();
        
        // Clean up the csv input by 
        // converting whitespace strings to a single space, and trimming
        var csvText = e.target.result.trim();
        csvText = csvText.replace(/\s\s+/g, ' ');
        tableArray = csvDataIntoArray(csvText);
        
        var tableHtml = buildTable(tableArray);
        $("#table-div").html(tableHtml).show();
        
        $("body").css("cursor", "default");
    };
    reader.onerror = function (e) {
        $("#file-display").html(e.target.result).show();
    };
}

function csvDataIntoArray(csvText) {
    // Split the CSV across newlines to get rows
    var lines = csvText.split(/[\r\n]+/g);
    
    var arr = [];
    
    // Map the question to the array of answers
    var i;
    for (i = 0; i < lines.length; i++) {
        // array of cells for this line - [0] is the question, rest are answers
        arr[i] = lines[i].split(",");
    }
    
    return arr;
}

function buildTable(tableArray) {    
    // Separate header since we don't want to randomize its position
    var header = tableArray[0];
    // Remove the header
    tableArray.splice(0, 1);
    //tableArray = shuffleArray(tableArray);
    
    var tableHeaderHtml = "<tr>";
    var i;
    for(i = 0; i < header.length; i++) {
        if(i == 0) {
            tableHeaderHtml += "<th class=\"question-column\">";
        }
        else {
            tableHeaderHtml += "<th>";
        }
        tableHeaderHtml += header[i] + "</th>";
    }
    tableHeaderHtml += "</tr>"
    
    // List of table rows, in HTML
    var output = [];
    output.push(tableHeaderHtml);
    // Output now consists of just the table header
    
    for (i = 0; i < tableArray.length; i++) {        
        var line = tableArray[i];
        
        // The row starts off with the question
        var row = "<tr><td>" + line[0] + "</td>";
        var j;
        // Then we add one text box cell per answer
        for(j = 1; j < line.length; j++) {
            if(line[j] && line[j].length !== 0) {
                // The ID corresponds to the index of the expected answer in tableArray
                // tableArray[1][1] will have id 1_1
                // Recall that tableArray[0][n] will hold questions
                var id = i + "_" + (j);
                row += "<td><textarea class=\"answer-textarea\" id=\"" + id + "\">" + 
                    "</textarea>&nbsp;</td>";
            }
        }
        row += "</tr>";
        output.push(row);
    }        
    output = "<table>" + output.join("") + "</table>";
    return output;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function uploadQuiz() {
    if(jQuery.isEmptyObject(tableArray)) {
        alert("There's nothing to upload! Select a file first.");
        return;
    }
    
    var jsonTable = JSON.stringify(tableArray);
    
    //console.log(jsonAnswers);
    //console.log('uploadQuiz');
    $.post('/answersets', jsonTable, function(data, status) {
        
    });
}

exports.buildTable = buildTable;