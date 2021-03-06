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
var injectHeaders = function(req, res, next){
    var fwdHost = req.headers['x-forwarded-host'] || req.headers['host'],
        fwdFor = req.headers['x-forwarded-for'],
        fwdProto = req.headers['x-forwarded-proto'];

    req.forwardedHeaders = {
        host: fwdHost,
        "for": fwdFor,
        proto: fwdProto,
        baseUrl: fwdProto + '://' + fwdHost
    };

    next();
};

module.exports = injectHeaders;