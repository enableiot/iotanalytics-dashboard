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

var MIN_LENGTH = 1,
    MAX_LENGTH = 1024,
    MAX_COUNT = 100;

var checkLimitsForAttributes = function (attributes, callback) {
    var errors = [];
    if(attributes && typeof attributes === 'object') {
        var keys = Object.keys(attributes);
        if (keys.length > MAX_COUNT) {
            errors.push('Too many attributes. Maximum accepted number is ' + MAX_COUNT);
        } else {
            keys.forEach(function (key) {
                if (key.length < MIN_LENGTH) {
                    errors.push('Attribute key ' + key + ' is too short. Its length is ' + key.length + '. Minimum accepted length is ' + MIN_LENGTH + '.');
                }
                if (key.length > MAX_LENGTH) {
                    errors.push('Attribute key ' + key + ' is too long. Its length is ' + key.length + '. Maximum accepted length is ' + MAX_LENGTH + '.');
                }
                if (attributes[key].length < MIN_LENGTH) {
                    errors.push('Attribute value ' + attributes[key] + ' under key ' + key + ' is too short. Its length is ' + attributes[key].length + '. Minimum accepted length is ' + MIN_LENGTH + '.');
                }
                if (attributes[key].length > MAX_LENGTH) {
                    errors.push('Attribute value ' + attributes[key] + ' under key ' + key + ' is too long. Its length is ' + attributes[key].length + '. Maximum accepted length is ' + MAX_LENGTH + '.');
                }
            });
        }
    }
    if(errors.length === 0) {
        callback(null);
    } else {
        callback(errors);
    }
};

module.exports = {
    checkLimitsForAttributes: checkLimitsForAttributes,
    MIN_LENGTH: MIN_LENGTH,
    MAX_LENGTH: MAX_LENGTH,
    MAX_COUNT: MAX_COUNT
};