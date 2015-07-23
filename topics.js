var dbHelper = require('./db-helper');

var PREFIX = 'test_kw_';
var USER_ID_REGEX = /(\w+)/;


module.exports = {

    // remember to subscribe to the topics that you are trying to handle here
    handle: function(topic, message) {
        var topicParts = topic.split("/");
        if(topicParts.length > 0) {
            switch(topicParts[0]) {
                case (PREFIX + 'users'): 
                    handleUsers(topicParts.slice(1, topicParts.length), message);
                    break;
                default:
                    console.log('handleMqttTopics: no match!');
            }
        }
    }
}



function handleUsers(topicParts, message) {
    console.log('handleUsers:' + topicParts);
    if(topicParts.length > 0) {
        if(topicParts[0] == 'online') {
            handleOnline(message);
        } else if(topicParts[0].match(USER_ID_REGEX)) {
            handleUser(topicParts, message);
        }
    }
}


function handleOnline(message) {
    console.log('handleOnline: ' + message);
}


function handleUser(topicParts, message) {
    console.log('handleUser');
    var user = topicParts[0];
    if(topicParts.length > 0) {
        switch(topicParts[1]) {
            case 'status':
                handleUserStatus(user, message);
                break;
            case 'messages':
                handleUserMessages(user, topicParts.slice(2, topicParts.length), message);
                break;
            case 'streams':
                handleUserStreams(user, topicParts.slice(2, topicParts.length), message);
                break;
            default:
                console.log('handleUser: no match!');
        }
    }
}


function handleUserStatus(user, message) {
    console.log('handleUserStatus: ' + message);
    switch(message.toString()) {
        case 'on':
            dbHelper.handleDBInsert(user, user);
            break;
        case 'off':
            dbHelper.handleDBUpdate(user);
            break;
        default:
            console.log('handleUserStatus: no match!');
    }
}


//TODO
function handleUserMessages(user, topicParts, message) {
    console.log('handleUserMessages: ' + user + ' ' + topicParts);
}


//TODO
function handleUserStreams(user, topicParts, message) {
    console.log('handleUserStreams: ' + user + ' ' + topicParts);
}