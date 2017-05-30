"use strict";

// Maps questions to answer arrays
var answersMap = {};
var answerTextAreasMap = {};

/*
window.onbeforeunload = function() {
    if(isEmptyObject(answersMap)) {
        return "Are you sure you want to leave? Your current quiz will be lost!";
    }
    return;
}
*/

function filePicked(files) {
    var file = files[0], 
        reader = new FileReader();
    
    if(files.length > 1) {
        alert("Only upload one file at a time.");
        return;
    }
    
    console.log("Uploaded " + file.name + ", size: " + (file.size / 1024) + "kb");
    reader.readAsText(file, "UTF-8");
    
    reader.onload = function (e) {
        $("#file-upload-indicator").html(file.name).show();
        buildTable(e.target.result);
    };
    reader.onerror = function (e) {
        $("#file-upload-indicator").html(e.target.result).show()
    };
}

function buildTable(csvText) {
    // For the duration of this function, busy the cursor
    $("body").css("cursor", "progress");
    
    // Split the CSV across newlines to get rows
    var lines = csvText.split(/[\r\n]+/g);
    
    // Separate header since we don't want to randomize its position
    var header = lines[0];
    lines = lines.slice(1, lines.length);
    //lines = shuffleArray(lines);
    
    var headerSplit = header.split(",");
    var headerHtml = "<tr>";
    var i;
    for(i = 0; i < headerSplit.length; i++) {
        if(i == 0) {
            headerHtml += "<th class=\"question-column\">";
        }
        else {
            headerHtml += "<th>";
        }
        headerHtml += headerSplit[i] + "</th>";
    }
    headerHtml += "</tr>"
    
    // List of table rows, in HTML
    var output = [];
    output.push(headerHtml);
    
    for (i = 0; i < lines.length - 1; i++) {
        // array of cells for this line - [0] is the question, rest are answers
        var line = lines[i].slice(0,-1).split(",");
        
        // Map the question to the array of answers
        answersMap[line[0]] = line.slice(1, line.length);
        
        // The row starts off with the question
        var row = "<tr><td>" + line[0] + "</td>";
        var j;
        // Then we add one text box cell per answer
        for(j = 1; j < line.length; j++) {
            row += "<td><textarea class=\"answer-textarea\"></textarea></td>";
        }
        row += "</tr>";
        output.push(row);
    }
    
    //console.log(answersMap);
    //console.log(output);
    
    output = "<table>" + output.join("") + "</table>";
    
    $("#table-div").html(output).show();
    
    $("body").css("cursor", "default");
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

function validate() {
    var tableContents = {};
    $("#table-div table tr").each(function() {
        var row = [];
        var tableData = $(this).find('td');
        if(tableData.length > 0) {
            // Slice to ignore the question (first td)
            tableData.slice(1, tableData.length).each(function() {
                row.push($(this).text());
            });
            
        }
    });
}
