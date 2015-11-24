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
var time = require('../../api/v1/time'),
    httpStatuses = require('../../res/httpStatuses');

var usage = function(req, res) {
    res.setHeader('Time-Methods', 'GET');
    res.status(httpStatuses.OK.code).send();
};

var getActualTime = function (req, res, next) {
    time.getActualTime( function(err, time){
        if (!err) {
            res.status(httpStatuses.OK.code).send({
                actualTime: time
            });
        } else {
            next(err);
        }
    });
};

module.exports = {
    usage: usage,
    getActualTime: getActualTime
};