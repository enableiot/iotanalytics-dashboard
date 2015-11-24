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
module.exports.cors = function () {
    return function (req, res, next) {
        if ((req.headers.origin) && (req.headers.origin !== '*')) {
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        }
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Headers', 'Authorization, X-Requested-With, Content-Type, x-apikey, x-userid, x-iotkit-requestid');
            res.status(200).send();
        } else {
            next();
        }
    };
};
