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

'use strict';
var logger = require('../../lib/logger').init(),
    connStatus = {connected :  1, authenticated: 2},
    connManager = require("./lib/conn-manager"),
    controlChannel = require('./plugins/control-channel'),
    httpServer = null,
    auth = null,
    serverInstance = null;


function createServer() {

    var io = require("socket.io")(httpServer);

    io.use(auth.authorize());

    io.on("ws-control-command", function(command){
        var deviceId = command.deviceId;
        connManager.get(deviceId).emit("command", command);
    });

    io.on('connection', function(socket) {
        var id = socket.decoded_token.sub;

        connManager.addConnection(id, socket, connStatus.connected) ;
        controlChannel.register(socket);

        logger.info("Device Connected: " + socket.decoded_token.sub + ". Active connections " + connManager.count());

        socket.on('disconnect', function(){
            connManager.removeConnection(id);
            logger.info("Device Disconnected. Active connections " + connManager.count());
        });
    });

    logger.info("Comm Server started");

    var localRoute = function(data) {
        var deviceId = data.content.deviceId;
        var conn = connManager.get(deviceId);
        if ( conn && conn.status === connStatus.connected) {
            connManager.get(deviceId).socket.emit(data.type, data.content);
        }
    };

    return {
        initialized: true,
        localRoute: localRoute
    };
}

exports.init = function(_server, _auth){
    httpServer = _server;
    auth = _auth;
    serverInstance = createServer();
};

exports.instance = function() {
    return serverInstance;
};
