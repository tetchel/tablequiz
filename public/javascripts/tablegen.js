"use strict";

function isTablePopulated() {
    return $('#table-div').text().length > 0;
}

function filePicked(files) {    
    var file = files[0], 
        reader = new FileReader();
    
    if(files.length > 1) {
        alert("Only upload one file at a time.");
        return;
    }
    
    if(isTablePopulated()) {
        if(window.location.pathname == '/') {
            var conf = confirm('Your current quiz will be lost. ' + 
                    'Are you sure you wish to continue?');
            
            if(conf !== true) {
                return;
            }
        }
        else {
            // Go back to root, then continue
            // TODO try this
            window.location.href = '/';
        }
    }
    
    console.log("Uploaded " + file.name + ", size: " + (file.size / 1024) + "kb");
    reader.readAsText(file, "UTF-8");
    
    reader.onload = function (e) {
        // For the duration of this function, busy the cursor
        $("body").css("cursor", "progress");
        
        var currentFile = file.name;
        // remove extension
        currentFile = currentFile.substr(0, currentFile.lastIndexOf('.'));
        
        $("#table-header").html(currentFile).show();
        $("#score-display").empty();
        
        // Clean up the csv input by 
        // converting whitespace strings to a single space, and trimming
        var csvText = e.target.result.trim();
        csvText = csvText.replace(/\s\s+/g, ' ');
        var tableArray = csvDataIntoArray(csvText);
        
        var tableHtml = buildTable(tableArray);
        $("#table-div").html(tableHtml).show();
        
        $("body").css("cursor", "default");
    };
    reader.onerror = function (e) {
        $("#table-header").html(e.target.result).show();
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
    
    // Start at 1 to skip over the header
    for (i = 1; i < tableArray.length; i++) {        
        var line = tableArray[i];
        
        // The row starts off with the question
        var row = "<tr><td>" + line[0] + "</td>";
        var j;
        // Then we add one text box cell per answer
        for(j = 1; j < line.length; j++) {
            if(line[j] && line[j].length !== 0) {
                // The data-answer attribute contains the answer for this textarea.
                row += '<td><textarea class=\"answer-textarea\"' +
                    'data-answer=\"' + tableArray[i][j] + '\">' +
                    '</textarea>&nbsp;</td>';
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
    $("body").css("cursor", "progress");
    
    if(!isTablePopulated()) {
        alert("There's nothing to upload! Select a file first.");
        $("body").css("cursor", "default");
        return;
    }
    
    var quizName = prompt('Please enter a name for this quiz.', $('#table-header').text());
    if(quizName === null) {
        // cancel was pressed
        $("body").css("cursor", "default");
        return;
    }
    
    clearValidation();
    var tableHtml = $('#table-div').html();
    var toPost = {
        quizName : quizName,
        table : tableHtml
    };
    
    $.ajax({
        type : 'POST',
        url : '/quizzes',
        data : toPost,
        dataType : 'json',
        timeout : 5000,
        success : function(data) {
            // clear the old table
            $('#table-div').empty();
            clearValidation();
            // Response is a JSO with the URL of the newly created table.
            window.location.href = data.redirect;
        },
        error: function(request, status, err) {
            console.log('Quiz upload failed. Status: ' + status + ' err: ' + err);
            if(status == "error") {
                alert('Upload failed. This means the server is currently down. Please try again later.');
            }
            else if(status == "timeout") {
                alert('Upload timed out. This means the server is currently down. Please try again later.');
            }
            else {
                alert('Upload failed for an unexpected reason: ' + status);
            }            
        }
    });
    
    $("body").css("cursor", "default");
}

exports.buildTable = buildTable;