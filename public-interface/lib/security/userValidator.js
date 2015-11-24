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

var cryptoUtils = require('./../cryptoUtils'),
    config = require('../../config'),
    Q = require('q');

var isEmailVerificationRequired = function () {
    if (config.verifyUserEmail === false) {
        return false;
    }
    return true;
};

var isEmailVerified = function (user, verificationRequired) {
    return Q.Promise(function (resolve, reject) {
        if (verificationRequired === false || !isEmailVerificationRequired()) {
            resolve();
        } else {
            if (user && user.verified === true) {
                resolve();
            } else {
                reject();
            }
        }
    });
};

var isPasswordCorrect = function (password, user) {
    return Q.Promise(function (resolve, reject) {
        cryptoUtils.verify(password, user.password, user.salt, function (isVerified) {
            if (isVerified === true) {
                resolve();
            } else {
                reject();
            }
        });
    });
};

module.exports = {
    isEmailVerified: isEmailVerified,
    isPasswordCorrect: isPasswordCorrect
};