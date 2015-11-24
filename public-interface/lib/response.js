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
var validator = require('./validator'),
    errBuilder = require('./errorHandler').errBuilder;

function statusCodeIsOK(statusCode) {
    if (statusCode === 200 || statusCode === 201 ||
        statusCode === 204) {
        return true;
    }
    return false;
}

exports.response = function end_call_factory(response, next) {
    var _response = response;
    var _next = next;
    var handler = function (status, message) {
        if (status instanceof Error) {
            return _next(status);
        } else if (statusCodeIsOK(status)) {
            if (!message) {
                return _response.status(status).send();
            } else if (validator.isString(message)) {
                return _response.status(status).send({response: message});
            }
            return _response.status(status).send(message);
        }
        var err = errBuilder.build(status, message);
        return _next(err);
    };
    return handler;
};
