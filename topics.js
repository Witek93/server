var dbHelper = require('./db-helper');
var mqtt = require('mqtt');
var events = require('events');

var eventEmitter = new events.EventEmitter();

var PREFIX = 'test_kw_';
var USER_ID_REGEX = /(\w+)/;

var mqttClient = undefined;

module.exports = {

    setClient: function(client) {
        mqttClient = client;
    },

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
    if(message == 'get') {
        console.log('handleOnline');
        dbHelper.getUsers(eventEmitter);
    } else {
        console.log('handleOnline: bad request: ' + message);
    }
}

eventEmitter.on('returnUsers', returnUsers);

function returnUsers(users) {
    console.log(users);
    if(mqttClient != undefined) {
        mqttClient.publish('test_kw_users/online', JSON.stringify(users), {qos: 2, retain: true});
        console.log('mqttClient publishing...\n');
    } else {
        console.log('mqttClient undefined');
    }
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
