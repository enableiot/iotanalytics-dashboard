/**
 * Copyright (c) 2014 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var WSClient = require('websocket').client;

function WebSocketClient(conf, logger) {
    var me = this;
    me.logger = logger;
    me.host = conf.host;
    me.port = conf.port;
    me.retryTime = conf.retryTime;
    me.retriesLimit = conf.retriesLimit;
    me.connected = false;
    me.connection = null;
    me.attempts = 0;
    me.secure = conf.secure;

    me.client = new WSClient();

    me.client.requestOptions = {
        rejectUnauthorized: conf.verifyCert
    };

    me.client.on('connectFailed', function() {
        logger.error("Websocket cannot connect.");
    });

    me.client.on('close', function() {
        logger.error("Websocket disconnected.");
        me.connected = false;
    });

    me.client.on('connect', function(connection){
        logger.info('Websocket connected on port: ' + me.port);
        me.connected = true;
        me.connection = connection;
        connection.on('close', function() {
            logger.info("Websocket connection closed.");
        });
    });


    me.connect = function() {
        if(!me.connected) {
            logger.info("Trying to establish a connection with websocket server... (attempt = " + (me.attempts++) + ")");
            if(me.secure) {
                me.client.connect('wss://' + me.host + ':' + me.port, 'echo-protocol', null, null, me.client.requestOptions);
            } else {
                me.client.connect('ws://' + me.host + ':' + me.port, 'echo-protocol', null, null, me.client.requestOptions);
            }
        }
    };

    me.publish = function(message) {
        var messageObject = {
            "type": 'actuation',
            "body": message,
            "credentials": {
                "username": conf.username,
                "password": conf.password
            }
        };
        if(!me.connected) {
            if(me.attempts < me.retriesLimit) {
                me.connect();
                setTimeout(function() {
                    me.publish(message);
                }, me.retryTime);
            } else {
                me.logger.error('Cannot connect to websockets server - ' + me.host + ':' + me.port + '. Actuation cannot be sent');
            }
        } else {
            me.attempts = 0;
            me.logger.debug('Publishing : MSG => ' + JSON.stringify(message));
            me.connection.sendUTF(JSON.stringify(messageObject));
        }

    };
    return me;
}

var wsConnector= null;
module.exports.singleton = function (conf, logger) {
    if (!wsConnector) {
        wsConnector = new WebSocketClient(conf, logger);
    }
    return wsConnector;
};
module.exports.WebSocketClient = WebSocketClient;
