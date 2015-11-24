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

var moment = require("moment");

exports.newTimeStamp = function() {
    return Math.round(new Date().getTime());
};

exports.dayToSeconds = function(days) {
    days = days || 1;
    return (days*24*3600);
};

exports.addHours = function(hours) {
    return moment.utc().add("h", hours)._d;
};

exports.addMinutes = function(minutes) {
    return moment.utc().add("m", minutes)._d;
};

exports.addSeconds = function(seconds) {
    return moment.utc().add("s", seconds)._d;
};

/**
 * If the param data.to is undefined, returned date.to will be the current time.
 * If the param data.from is undefined, returned date.from will be zero.
 * If from is positive it will represent the number of milliseconds since Jan-01-1970T00:00:00.000.
 * If from is negative, it represents the number of seconds to add to date.to (because the number is negative,
 * it will decrease to, moving backward in time).
 * @param data: {{from: Number, to: positive Number}}
 * @returns {{from: date in milliseconds, to: date in milliseconds}}
 */
exports.extractFromAndTo = function (data) {
    var now = parseInt(new Date().getTime());
    var to;
    if(!data.to) {
        to = now;
    } else if(data.to < 0) {
        to = now + (data.to * 1000);
    } else {
        to = data.to;
    }
    var from;

    if(!data.from) {
        from = 0;
    } else {
        from = data.from < 0 ? to + (data.from * 1000) : data.from;
    }

    delete data.to;
    delete data.from;
    return {
        from: from,
        to: to
    };
};