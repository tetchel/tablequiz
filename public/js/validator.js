"use strict";

///// Depends on nothing /////

var CLASS_CORRECT = "correct-answer";
var CLASS_WRONG = "wrong-answer";
var CORRECT = "&#10004; Correct";

function clearValidation() {
    $('.' + CLASS_CORRECT).remove();
    $('.' + CLASS_WRONG).remove();
}

function validate() {
    $("body").css("cursor", "progress");    
    
    clearValidation();
    
    var answerTextBoxes = $(".answer-textarea");
    // track # of questions right/wrong
    var numCorrect = 0, total = 0;
        
    answerTextBoxes.each(function() {
        var answer = $(this).data('answer');
        var text = $(this).val();
        
        // Write either Correct or Wrong under each answer box
        var toAppend = "";
        if(isCorrectAnswer(text, answer)) {
            toAppend = "<span class=\"" + CLASS_CORRECT + "\">" + CORRECT + "</span>";
            numCorrect++;
        }
        else {
            // Wrong answers can also be doubleclicked to change to right answers
            toAppend = "<span class=\"" + CLASS_WRONG + "\"" +
                    "ondblclick=\"overrideValidation(event)\"" +
                    "title=\"Double-click if you insist this is correct!\">" +
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
        setScore(numCorrect, total);
    }
        
    $("body").css("cursor", "default");
}

var scoreCorrect = 0;
var scoreTotal = 0;

function setScore(numCorrect, total) {
    scoreCorrect = numCorrect;
    scoreTotal = total;
    
    var percent = (numCorrect / total) * 100;
    percent = parseFloat(percent).toFixed(1);

    var spanClass = "";
    if(percent > 80) {
        spanClass = CLASS_CORRECT;
    }
    else if(percent < 60) {
        spanClass = CLASS_WRONG;
    }

    $("#score-display").html(numCorrect + " / " + total + " &nbsp; | &nbsp; " +
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
    event.target.innerHTML = CORRECT;
    event.target.className = CLASS_CORRECT;
}