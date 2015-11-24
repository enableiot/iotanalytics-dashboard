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
// singleton
var instance;

var middleware = function(req, res, next){
    if (!instance) {
        instance = {
            'set': function(key, value){
                if (!req.contextProvider) {
                    req.contextProvider = {};
                }
                req.contextProvider[key] = value;
            },
            'get': function(key){
                var ret;
                if (req.contextProvider) {
                    ret = req.contextProvider[key];
                }

                return ret;
            }
        };
    }

    next();
};

var getInstanceWrapper = function(){
    // return wrapper
    return {
        'set': function(){
            if (instance) {
                instance.set(arguments[0], arguments[1]);
            }
        },
        'get': function(){
            if (instance) {
                return instance.get(arguments[0]);
            }
        }
    };
};

module.exports = {
    middleware: middleware,
    instance: getInstanceWrapper
};