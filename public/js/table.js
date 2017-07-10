"use strict";

///// Depends on misc.js /////

$(document).ready(function() {
    // This bit only runs if it's a saved quiz
    var tableData = $('#table-div').data('table');
    
    if(tableData) {
        var tableArray = [];
        for(var item in tableData) {
            tableArray.push(tableData[item]);
        }

        showTable(tableArray);
    }
});

window.onbeforeunload = function() {
    if(shouldConfirmExit()) {
        return 'Your generated quiz will be lost. Are you sure you want to exit?';
    }
}

function isTablePopulated() {
    return $('#table-div').text().length > 0;
}

// Return true if user is on the root page and has uploaded a table.
function shouldConfirmExit() {
    return isTablePopulated() && window.location.pathname == '/';
}

var glob_table = [];

function filePicked(files) {
    var file = files[0];
    
    if(files.length > 1) {
        alert("Only upload one file at a time.");
        return;
    }
    
    if(shouldConfirmExit()) {
        var conf = confirm('Your current quiz will be lost. ' + 
            'Are you sure you wish to continue?');

        if(conf !== true) {
            return;
        }
    }
    
    console.log("Uploaded " + file.name + ", size: " + (file.size / 1024) + "kb");
    
    var fileName = file.name;        
    var extensionIndex = fileName.lastIndexOf('.');
    var extension = fileName.substring(extensionIndex, fileName.length);
    fileName = fileName.substr(0, extensionIndex);
    
    var reader = new FileReader();
    reader.onerror = function (e) {
        $("#content-header").html('<span class=\"wrong-answer\">Error reading ' + fileName
                                    + e.target.result + '</span>').show();
    };
    
    if(extension == '.csv') {
        reader.readAsText(file, "UTF-8");
        reader.onload = function (e) {
            var csvData = e.target.result;
            console.log('Success reading csv ' + fileName);
            onUploadSuccess(fileName, csvData);
        }
    }
    else if(extension == '.xls' || extension == '.xlsx') {
        reader.readAsBinaryString(file);        
        reader.onload = function(e) {            
            var workbook = XLSX.read(e.target.result, {type: 'binary'});
            
            // Test for and handle multiple-sheet workbooks
            var numSheets = workbook.SheetNames.length;
            console.log(numSheets + ' sheets');
            var sheet = 0;
            if(numSheets > 1) {
                var validSheet = false;
                var msg = 'This workbook has ' + numSheets + ' sheets. ' +
                            'Which one would you like to import?';
                
                while(!validSheet) {
                    sheet = prompt(msg, '1');
                    if(sheet) { 
                        sheet = sheet.trim(); 
                    }

                    if(isNaN(sheet) || sheet > numSheets || sheet < 1 || !Number.isInteger(+sheet)) {
                        msg = '"' + sheet + '" is not a valid sheet number. Must be 1 to ' + numSheets;
                    }
                    else {
                        validSheet = true;
                        // human to computer index conversion
                        sheet = sheet - 1;
                    }
                }
            }
            // Convert to csv; we already know what to do from there
            var csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[sheet]]);
            console.log('Success converting ' + fileName + ' to csv');
            
            onUploadSuccess(fileName, csvData);
        }
    }
    else {
        $('#content-header').html('Unexpected file type ' + extension);
    }
}

function showTable(tableArray) {
    console.log(tableArray);
    var tableHtml = buildTable(tableArray);
    $('#table-div').html(tableHtml).show();
}

function onUploadSuccess(fileName, csvData) {
    csvData = csvData.trim().replace(/\s\s+/g, ' ');
    var tableArray = csvToArray(csvData);
    // Glob_table must not be modified. Deep copy tableArray
    glob_table = JSON.parse(JSON.stringify(tableArray));
    
    $('#content-header').html(fileName).show();
    $('#score-display').empty();
    
    showTable(tableArray);
}

function csvToArray(csvText) {
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
    tableArray = tableArray.slice(1, tableArray.length);
    
    // Randomize table rows if specified
    if(localStorage.getItem('randomize-rows') == "true") {
        tableArray = shuffleArray(tableArray);
    }
    
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
    
    var quizName = prompt('Please enter a name for this quiz.', $('#content-header').text());
    if(quizName === null) {
        // cancel was pressed
        $("body").css("cursor", "default");
        return;
    }
    
    clearValidation();
    
    // Since the displayed table might be different, we must re-build the html
//    var tableHtml = buildTable(glob_table);
    var toPost = {
        quizName : quizName,
        table : glob_table
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
            
            // Save this as 'your' quiz in the localstorage
            var currentUploads = localStorage.getItem('uploads');
            if(!currentUploads) {
                currentUploads = '';
            }
            else {
                currentUploads = JSON.parse(currentUploads);
            }
            
            var uploads = [];
            for(var x in currentUploads) {
                uploads.push(currentUploads[x]);
            }
            console.log(uploads);
            
            uploads.push({ quizName: quizName, url: data.redirect });
            localStorage.setItem('uploads', JSON.stringify(uploads));
            
            // The server gave us the URL of the newly created table.
            window.location.href = data.redirect;
        },
        error: function(request, status, err) {
            console.log('Quiz upload failed. Status: ' + status + ' err: ' + err);
            if(status == "error") {
                alert('Upload failed: ' + err + ' - Please try again later.');
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

//exports.buildTable = buildTable;