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
var getRedisLockKey = function (email) {
    return "lock:" + email;
};
var getRedisLoginFailsKey = function (email) {
    return "loginFails:" + email;
};
module.exports = function (client) {
    this.incrementLoginFailedCounter = function (email, resultCallback) {
        client().incr(getRedisLoginFailsKey(email), resultCallback);
    };

    this.getLoginLockPeriod = function (email, resultCallback) {
        client().ttl(getRedisLockKey(email), resultCallback);
    };

    this.increaseLoginLockPeriod = function (email, period, loginFails, maxUnsuccessfulLoginAttempts, resultCallback) {
        var unixSeconds = Math.floor((new Date().getTime() + period * Math.floor(loginFails / maxUnsuccessfulLoginAttempts)) / 1000);
        var redisClient = client();
        redisClient.incr(getRedisLockKey(email), function () {
            redisClient.expireat(getRedisLockKey(email), unixSeconds, resultCallback);
        });
    };

    this.deleteByEmail = function (email, resultCallback) {
        client().del(getRedisLoginFailsKey(email), resultCallback);
    };
};