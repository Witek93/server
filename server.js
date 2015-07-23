var mqtt = require('mqtt');

var dbHelper = require('./db-helper');
var topics   = require('./topics');

var PREFIX = 'test_kw_';
var TOPICS = {
    USER_STATUS:   PREFIX + 'users/+/status',
    USER_MESSAGES: PREFIX + 'users/+/messages/to/+',
    USER_STREAMS:  PREFIX + 'users/+/streams/+',
    USERS_ONLINE:  PREFIX + 'users/online'
}


var BROKER_URL = 'tcp://10.132.15.29:1883';
var mqttClient = mqtt.connect(BROKER_URL, {connectTimeout: 200});


var reconnectionAttempts = 0;
var RECONNECTION_ATTEMPTS_LIMIT = 5;



// set callbacks for mqtt client
mqttClient.on('connect', onMqttConnect);
mqttClient.on('offline', onMqttOfflineClient);
mqttClient.on('message', topics.handle);
mqttClient.on('error', onMqttError);


function onMqttOfflineClient() {
    if(reconnectionAttempts++ < RECONNECTION_ATTEMPTS_LIMIT) {
        console.log('No[' + reconnectionAttempts + '] trying to reconnect to ' + BROKER_URL);
    } else {
        console.log('Closing the MQTT client');
        mqttClient.end();
    }
}


function onMqttConnect() {
    console.log('MQTT: on connect');
    reconnectionAttempts = 0;
    for(var key in TOPICS) {
        if(TOPICS.hasOwnProperty(key)) {
            console.log('subscribed to: ' + TOPICS[key]);
            mqttClient.subscribe(TOPICS[key]);
        }
    }
    dbHelper.dbConnect();
}


function onMqttError(err) {
    console.log('onMqttError: ' + err);
}
