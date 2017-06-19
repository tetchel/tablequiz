$(document).ready(function() {
    updateUploads();
});

function settingsListener(element) {
    element = $(element);
    
    var settingName = element.parent().attr('id');
    // assume only one sibling
    var sibling = $(element.siblings()[0]);
    
    var setting;
    var color;
    if(element.hasClass('btn-on')) {
        setting = true;
        color = '#00dd00';
    }
    else if(element.hasClass('btn-off')) {
        setting = true;
        color = '#dd0000';
    }
    
    console.log(settingName + ' = ' + setting);
    var oldBackground = element.css('background');
    element.css('background', color);
    sibling.css('background', oldBackground);
}

function updateUploads() {
    var uploads = ['HandQuiz', 'BrachialPlexusAxillaQuiz'];
    
    $.each(uploads, function(index, item) {
        var linkToItem = 'http://' + location.host + '/quizzes/' + item;
        
        $('#uploads-list').append('<li class="list-group-item"><a target="_blank" href="' + 
                                  linkToItem + '">' + item + '</li>');
    });
}

