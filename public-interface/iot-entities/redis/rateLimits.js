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

module.exports = function(client){
    this.incrementCounter = function (identity, route, method, resultCallback) {
        var key = identity + "#" + route + "#" + method;
        var redisClient = client();
        redisClient.incr(key);
        redisClient.ttl(key, function (err, ttl) {
            if (ttl < 0) {
                ttl = 3600;
                redisClient.expire(key, ttl);
            }
            redisClient.get(key, function (err, reply) {
                resultCallback(null, {
                    ttl: ttl,
                    requesterId: identity,
                    hits: reply,
                    route: route,
                    method: method
                });
            });
        });
    };
};




