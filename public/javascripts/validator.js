"use strict";

var correctClass = "correct-answer";
var wrongClass = "wrong-answer";
var correctString = "&#10004; Correct";

function validate() {
    $("body").css("cursor", "progress");
    
    // Delete previous validation results
    $('.' + correctClass).remove();
    $('.' + wrongClass).remove();
    
    var answerTextBoxes = $(".answer-textarea");
    // track # of questions right/wrong
    var correct = 0, total = 0;
        
    answerTextBoxes.each(function() {
        var id = $(this).attr('id');
        // Recall the element's ID is its answer index i_j
        var iIndex = id.substr(0, id.indexOf("_"));
        var jIndex = id.substr(id.indexOf("_") + 1);
        
        var text = $(this).val();
        
        // NOTE THAT tableArray is a global in tablegen.js.
        // This is probably not the best way to share the data.
        var answer = tableArray[iIndex][jIndex];
        
        // Write either Correct or Wrong under each answer box
        var toAppend = "";
        if(isCorrectAnswer(text, answer)) {
            toAppend = "<span class=\"" + correctClass + "\">" + correctString + "</span>";
            correct++;
        }
        else {
            // Wrong answers can also be doubleclicked to change to right answers
            toAppend = "<span class=\"" + wrongClass + "\"" +
                    "ondblclick=\"overrideValidation(event)\">" +
                    "&#10006; Expected: " + answer + "</span>";
        }
        
        total++;
        var parent = $(this).parent();
        parent.append(toAppend);
    });
    
    if(answerTextBoxes.length == 0) {
        alert("There are no answers to validate.");
    }
    else {
        setScore(correct, total);
    }
        
    $("body").css("cursor", "default");
}

var scoreCorrect = 0;
var scoreTotal = 0;

function setScore(correct, total) {
    scoreCorrect = correct;
    scoreTotal = total;
    
    var percent = (correct / total) * 100;
    percent = parseFloat(percent).toFixed(1);

    var spanClass = "";
    if(percent > 80) {
        spanClass = correctClass;
    }
    else if(percent < 60) {
        spanClass = wrongClass;
    }

    $("#score-display").html(correct + " / " + total + " &nbsp; | &nbsp; " +
        "<span class=\"" + spanClass + "\">"+ percent + " %</span>").show();
}

/**
 * Verify that the given answer is "close enough" to the expected answer.
 *
 * Right now this is done by .contains, plus a sanity check in verifying that 
 * the answer is at least as long as the shortest word in the expected answer.
 *
 * This is far from perfect, but better than requiring "exact" equality.
 */
function isCorrectAnswer(actual, expected) {
    actual = actual.trim().toLowerCase();
    expected = expected.trim().toLowerCase();
    
    var shortestWordLength = expected
            .split(" ")
            // sort shortest -> longest
            .sort(function(a, b) { return b.length - a.length; })
            // the first element is the shortest word
            .pop().length;

    return actual.length >= shortestWordLength && 
        expected.indexOf(actual) != -1;
}

function overrideValidation(event) {
    setScore(scoreCorrect + 1, scoreTotal);
    event.target.innerHTML = correctString;
    event.target.className = correctClass;
}