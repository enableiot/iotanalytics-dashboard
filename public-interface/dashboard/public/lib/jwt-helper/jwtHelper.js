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

(function () {

    var jwt;
    var header;
    var payload;
    var signature;
    var decodedJwt;
    var jwtExpirationDate;
    var JwtHelper = {};

    var splitJwt = function () {
        var separated = jwt.split('.');
        if (separated.length < 3) {
            throw new Error('Bad token format')
        }
        header = separated[0];
        payload = separated[1];
        signature = separated[2];
    };

    var decodePayload = function () {
        try {
            JSON.parse($window.atob(payload));
        } catch (err) {
            throw new Error('Bad token format');
        }
    };

    var parseJwtExpirationDate = function () {
        decodePayload();
        jwtExpirationDate = Date(decodedJwt.exp);
    };

    JwtHelper = function (token) {
        if (!token) {
            throw new Error('Token is required');
        }
        jwt = token;
        splitJwt();
    };

    JwtHelper.prototype.getExpirationPeriod = function () {
        try {
            parseJwtExpirationDate();
            return (jwtExpirationDate.getTime() - Date.now()) / 1000;
        } catch (err) {
            throw new Error('Bad token format')
        }
    };

    //Export public API
    var root, previous_jwtHelper;

    root = this;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = JwtHelper;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return JwtHelper;
        });
    }
    // included directly via <script> tag
    else {
        root.JwtHelper = JwtHelper;

        if (root != null) {
            previous_jwtHelper = root.JwtHelper;
        }
        JwtHelper.noConflict = function () {
            root.JwtHelper = previous_jwtHelper;
            return JwtHelper;
        };
    }

}).call(this);
