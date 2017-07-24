"use strict";

///// Depends on nothing /////

var CLASS_CORRECT = 'correct-answer';
var CLASS_WRONG = 'wrong-answer';
var CLASS_ANSWER_SPOT = 'answer-spot';
var CLASS_TEXTAREA = 'answer-textarea';
var CORRECT = "&#10004; Correct";

var VALID_BTN_TEXT = 'Check Answers';

function clearValidation(validBtn) {
    $('.' + CLASS_CORRECT).remove();
    $('.' + CLASS_WRONG).remove();
    $('.' + CLASS_ANSWER_SPOT).html('&nbsp;');
    $('#score-display').html('&nbsp;');
    toggleValidateButton(validBtn);
}

// Set the Validate button to either Check Answers or Clear Answers
function toggleValidateButton(validBtn) {
    var text = $(validBtn).text();
    
    if(text == VALID_BTN_TEXT) {
        // Validate button now clears validation
        $(validBtn).text('Clear Answers');
        $(validBtn).attr('onclick', 'clearValidation(this)');
    }
    else { 
        $(validBtn).text(VALID_BTN_TEXT);
        $(validBtn).attr('onclick', 'validate(this)');
    }
}

// validate a given textarea. parameter is a jquery object.
// returns whether or not the validation was correct
function validateTextarea(textarea) {
    var answer = textarea.data('answer');
    var text = textarea.val();

    // Write either Correct or Wrong under each answer box
    var answerDisplayHtml = '';
    var correct = false;
    if(isCorrectAnswer(text, answer)) {
        answerDisplayHtml = "<span class=\"" + CLASS_CORRECT + "\">" + CORRECT + "</span>";
        correct = true;
    }
    else {
        // Wrong answers can also be doubleclicked to change to right answers
        answerDisplayHtml = "<span class=\"" + CLASS_WRONG + "\"" +
                "ondblclick=\"overrideValidation(event)\"" +
                "title=\"Double-click if you insist this is correct!\">" +
                "&#10006; Expected: " + answer + "</span>";
    }

    textarea.parent().find('.' + CLASS_ANSWER_SPOT).html(answerDisplayHtml);
    return correct;   
}

function validate(validBtn) {
    clearValidation(validBtn);
    
    var answerTextBoxes = $('.' + CLASS_TEXTAREA);
    // track # of questions right/wrong
    var numCorrect = 0, total = 0;
        
    answerTextBoxes.each(function() {
        if(validateTextarea($(this))) {
            numCorrect++;
        }        
        total++;
    });
    
    if(answerTextBoxes.length == 0) {
        alert("There are no answers to validate.");
    }
    else {
        setScore(numCorrect, total);
    }
}

function onTextareaBlur(element) {
    if(localStorage.getItem('validate-after-row') != 'true') {
        return;
    }
    
    var rowTextAreas = $(element).parent().parent().find('.' + CLASS_TEXTAREA);
    
    var allAreasAnswered = true;
    for(var i = 0; i < rowTextAreas.length; i++) {
        var textArea = $(rowTextAreas[i]);
        if(textArea.val().trim().length === 0) {
            allAreasAnswered = false;
            break;
        }
    }
    
    if(allAreasAnswered) {
        rowTextAreas.each(function() {
           validateTextarea($(this)); 
        });
    }
    
    // set the score only when all rows are finished
    var correct = $('.' + CLASS_CORRECT).length;
    var wrong = $('.' + CLASS_WRONG).length;
    var total = $('.' + CLASS_TEXTAREA).length;
    
    if(correct + wrong === total) {
        setScore(correct, total);
    }
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