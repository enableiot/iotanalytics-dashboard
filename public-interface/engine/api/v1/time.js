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
var errBuilder = require('../../../lib/errorHandler/index').errBuilder;

var actualTime = function() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

var getActualTime = function (callback) {
    var time = actualTime();
    if (time) {
        callback(null, time);
    } else {
        callback( errBuilder.build(errBuilder.Errors.Time.DateReceiveError));
    }
};

module.exports = {
    getActualTime: getActualTime
};