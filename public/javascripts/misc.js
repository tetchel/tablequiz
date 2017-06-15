"use strict";

window.onbeforeunload = function() {
    /*if(!jQuery.isEmptyObject(tableArray)) {
        return "Are you sure you want to leave? Your current quiz will be lost!";
    }*/
    return;
}

function copyRelPath() {
    copyToClipboard(window.location.href);
}

function copyToClipboard(text) {
    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text); 

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.log('Couldn\'t copy to clipboard ; user must do it manually');
            console.log(ex);
            prompt('Copy the link below:', text);         
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

///// Enable drag & dropping files onto the top bar /////

$(document).ready(function() {
    enableDragNDrop('top-bar');
})

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var files = dt.files;

    filePicked(files);
}

function enableDragNDrop(dropAreaId) {
    var dropbox = document.getElementById(dropAreaId);
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
}