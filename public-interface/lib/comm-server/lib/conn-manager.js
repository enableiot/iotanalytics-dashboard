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

var connections = {};

exports.addConnection = function(id, socket, status){
    connections[id] = {socket: socket, status: status};
};

exports.setStatus = function(id, status) {
    connections[id].status = status;
};

exports.removeConnection = function(id) {
    if (connections[id]) {
        delete connections[id];
    }
};

exports.get = function(id) {
    return connections[id];
};

exports.count = function() {
    return Object.keys(connections).length;
};