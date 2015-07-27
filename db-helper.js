var pg = require('pg');

var DATABASE_CONFIGURATION = {
    user:     'soc',
    password: 'soc',
    database: 'soc_komunikator',
    host:     '10.132.15.29',
    port:      5432
};
var client = new pg.Client(DATABASE_CONFIGURATION);


var TABLE_NAME = 'test_kw_users';

// queries for postgres database
var QUERIES = {
        GET_USERS: 'SELECT * FROM ' + TABLE_NAME,
        GET_USER:  'SELECT 1 FROM ' + TABLE_NAME + ' WHERE login=($1)',
        POST_USER: 'INSERT INTO ' + TABLE_NAME +
               ' (last_seen, online, login, name) values ($1, $2, $3, $4)',
        PUT_USER:  'UPDATE ' + TABLE_NAME +
               ' SET last_seen=($1), online=($2) WHERE name=($3)'
}



module.exports = {

        getUsers: function(emitter) {
                if(client != undefined) {
                        var query = client.query(QUERIES.GET_USERS, function(err, res) {
                                if(err) {
                                        console.log(err);
                                }
                        });
                        query.on('end', function(result) {
                            emitter.emit('returnUsers', result.rows);
                        });
                }
        },

        closeDB: function () {
            if(client != undefined) {
                client.end();
                console.log('DB connection closed');
            }
        },


        dbConnect: function () {
            client.connect(function(err) {
                if(err) {
                    return console.log('Could not connect to DB');
                } else {
                    return console.log('DB connected');
                }
            });
        },


        // should be upgraded with usage of transaction or upsert functionality
        handleDBInsert: function (login, name) {
            if(client != undefined) {
                client.query(QUERIES.GET_USER, [login], function(err, result) {
                    if(err) {console.log('GET_USER: ' + err);}
                    if(result.rowCount == 0) {
                        //insert
                        client.query(QUERIES.POST_USER, [null, true, login, name], function(err) {
                            if(err) {console.log('POST_USER: ' + err);}
                        });
                    } else {
                        //update
                        client.query(QUERIES.PUT_USER, [null, true, login], function(err) {
                            if(err) {console.log('PUT_USER: ' + err);}
                        });
                    }
                });
            }
        },


        handleDBUpdate: function (login) {
            if(client != undefined) {
                client.query(QUERIES.PUT_USER, ['\'now()\'', false, login], function(err) {
                    if(err) {
                        console.log('UPDATE query error:' + err);
                    }
                });
            }
        },


        handleDBSelect: function () {
            if(client != undefined) {
                client.query(QUERIES.GET_USERS, function(err, result) {
                    if(err) {
                        return console.log('SELECT query error');
                    } else {
                        if(result) {
                            result.rows.forEach(function(row) {
                                console.log(row);
                            });
                        }
                    }
                });
            } else {
                console.log('Cannot run SELECT query. DB is not connected');
            }
        }

};
