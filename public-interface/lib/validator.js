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
/*global toString */

exports.isString = function (text) {
    return (toString.call(text).search(/String]$/) !== -1);
};

exports.isObject = function(data_obj) {
    return (toString.call(data_obj).search(/Object]$/) !== -1);
};

exports.isArray = function (data) {
    return Array.isArray(data);
};