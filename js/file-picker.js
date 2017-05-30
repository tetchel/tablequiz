"use strict";

// The first index is the question # (zero-indexed), the second index 
// is the nth answer column corresponding to that question
var answersArray = [];


window.onbeforeunload = function() {
    if(isEmptyObject(answersMap)) {
        return "Are you sure you want to leave? Your current quiz will be lost!";
    }
    return;
}

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
        $("#file-display").html(file.name).show();
        buildTable(e.target.result);
    };
    reader.onerror = function (e) {
        $("#file-display").html(e.target.result).show()
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
        var line = lines[i].split(",");
        
        // Map the question to the array of answers
        answersArray[i] = line.slice(1, line.length);
        
        // The row starts off with the question
        var row = "<tr><td>" + line[0] + "</td>";
        var j;
        // Then we add one text box cell per answer
        for(j = 1; j < line.length; j++) {
            if(line[j] && line[j].length !== 0) {
                // The ID corresponds to the index of the expected answer in answersArray
                // answersArray[1][1] will have id 1_1
                var id = i + "_" + (j-1);
                row += "<td><textarea class=\"answer-textarea\" id=\"" + id + "\">" + 
                    "</textarea>&nbsp;</td>";
            }
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
    $("body").css("cursor", "progress");
    
    // Delete previous validation results
    $(".correct-answer").remove();
    $(".wrong-answer").remove();
    
    var answerTextBoxes = $(".answer-textarea");
    // track # of questions right/wrong
    var correct = 0, total = 0;
        
    answerTextBoxes.each(function() {
        var id = $(this).attr('id');
        // Recall the element's ID is its answer index i_j
        var iIndex = id.substr(0, id.indexOf("_"));
        var jIndex = id.substr(id.indexOf("_") + 1);
        
        var text = $(this).val();        
        var answer = answersArray[iIndex][jIndex];
        
        // Write either Correct or Wrong under each answer box
        var toAppend = "";
        if(answer.trim().toLowerCase().localeCompare(text.toLowerCase().trim()) === 0) {
            toAppend = "<span class=\"correct-answer\">&#10004; Correct" + "</span>";
            correct++;
        }
        else {
            toAppend = "<span class=\"wrong-answer\">&#10006; Expected: " + answer + "</span>";
        }
        
        total++;        
        var parent = $(this).parent();
        parent.append(toAppend);
    });
    
    if(answerTextBoxes.length == 0) {
        alert("There are no answers to validate.");
    }
    else {
        var percent = (correct / total) * 100;
        percent = parseFloat(percent).toFixed(2);
        
        var spanClass = "";
        if(percent > 80) {
            spanClass = "correct-answer"
        }
        else if(percent < 60) {
            spanClass = "wrong-answer";
        }
        
        $('#score-display').html(correct + " / " + total + " &nbsp; | &nbsp; " +
            "<span class=\"" + spanClass + "\">"+ percent + " %</span>").show();
    }
        
    $("body").css("cursor", "default");
}
