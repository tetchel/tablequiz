"use strict";

window.onbeforeunload = function() {
    if(isEmptyObject(answersArray)) {
        return "Are you sure you want to leave? Your current quiz will be lost!";
    }
    return;
}