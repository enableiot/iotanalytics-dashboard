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

var config = require('../../config').auth,
    errBuilder = require('./../errorHandler').errBuilder,
    httpStatuses = require('../../engine/res/httpStatuses');

var isFacebookAvailable = function() {
    return config.facebook && config.facebook.clientID && config.facebook.clientID !== '';
};

var isGoogleAvailable = function() {
    return config.google && config.google.clientID && config.google.clientID !== '';
};

var isGithubAvailable = function() {
    return config.github && config.github.clientID && config.github.clientID !== '';
};

var socialLoginConfig = function() {
    return {
        'facebook': isFacebookAvailable(),
        'google': isGoogleAvailable(),
        'github': isGithubAvailable()
    };
};

exports.getSocialLoginConfig = function(req, res, next) {
    if (!isFacebookAvailable() && !isGithubAvailable() && !isGoogleAvailable()) {
        next(errBuilder.build(errBuilder.Errors.User.SocialLoginNotConfigured));
    } else {
        res.status(httpStatuses.OK.code).send(socialLoginConfig());
    }
};

exports.isFacebookAvailable = isFacebookAvailable;
exports.isGoogleAvailable = isGoogleAvailable;
exports.isGithubAvailable = isGithubAvailable;

