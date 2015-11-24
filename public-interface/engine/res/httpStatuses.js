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

module.exports = {
    OK : {code: 200, status: 200, message:"OK"},
    Created : {code: 201, status: 201, message:"Created"},
    DeleteOK : {code: 204, status: 204, message:"Delete OK"},
    BadRequest: {code: 400, status: 400, message:"Bad Request"},
    EntityTooLarge: {code: 413, status: 413, message: "Entity too large"}
};