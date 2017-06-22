$(document).ready(function() {
    setButtonValues();
    updateUploads();
});

var BUTTON_ON = '#00dd00';
var BUTTON_OFF = '#dd0000';

function setButtonValues() {
    $('.setting-toggle').each(function(index, item) {
        var settingName = $(item).attr('id');
        var toggled = localStorage.getItem(settingName);
        if(toggled === "true") {
            setBtnGroupBackground($(item).find('.btn-on'), BUTTON_ON);
        }
        else {
            setBtnGroupBackground($(item).find('.btn-off'), BUTTON_OFF);
        }
    });
}

function settingsListener(element) {
    element = $(element);
    
    var settingName = element.parent().attr('id');
    
    var setting;
    var color;
    if(element.hasClass('btn-on')) {
        setting = true;
        color = BUTTON_ON;
    }
    else if(element.hasClass('btn-off')) {
        setting = false;
        color = BUTTON_OFF;
    }
    
    setBtnGroupBackground(element, color);
    localStorage.setItem(settingName, setting);
}

function setBtnGroupBackground(element, color) {
    // assume only one sibling
    var sibling = $(element.siblings()[0]);
    
    var oldBackground = element.css('background');
    element.css('background', color);
    sibling.css('background', oldBackground);
}

function updateUploads() {
    var uploads = localStorage.getItem('uploads');
    uploads = JSON.parse(uploads);
    
    $.each(uploads, function(index, item) {
        //var linkToItem = 'http://' + location.host + '/quizzes/' + item;
        
        $('#uploads-list').append('<li class="list-group-item"><a target="_blank" href="' + 
                                  item.url + '">' + item.quizName + '</li>');
    });
}

