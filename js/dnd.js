"use strict";

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