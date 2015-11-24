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

var request = require('request'),
    querystring = require('querystring'),
    errBuilder = require('../errorHandler').errBuilder,
    httpStatuses = require('../../engine/res/httpStatuses'),
    user = require('../../iot-entities/postgresql').users;

var prepareMessageToGoogle = function(req, conf) {
    var data = {
        "privatekey" : conf.captcha.privateKey,
        "remoteip" : (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress,
        "challenge" : req.body.challenge,
        "response" : req.body.response
    };
    data = querystring.stringify(data);

    return data;
};

var checkIfTestEmail = function (email) {
    var testAccountPattern = new RegExp(user.TEST_ACCOUNT_PATTERN);
    return testAccountPattern.test(email);
};

var getValidationFromGoogle = function(conf, req, res, next) {
    //passing requests from tests
    if (req.body.response === conf.captcha.testsCode && checkIfTestEmail(req.body.email)) {
        next();
    } else {
        var data = prepareMessageToGoogle(req, conf);

        var options = {
            url: conf.captcha.googleUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            },
            body: data
        };

        request(options, function(err, resGoogle) {
            if (!err && (resGoogle.statusCode === httpStatuses.OK.status)) {
                /*
                 The response from google verification is a series of strings separated by \n.
                 First line tells if it was successful.
                 Second is error code.
                 */
                var googleResponse = resGoogle.body.split('\n');
                if (googleResponse[0] !== 'true') {
                    return next(errBuilder.build(errBuilder.Errors.Captcha.InvalidCaptcha));
                }
                return next();
            }
            else {
                return next('Unexpected response from recaptcha: ' + JSON.stringify(resGoogle));
            }
        });
    }
};

module.exports = {
    protectWithCaptcha: function(conf) {
        return function(req, res, next) {
            function stripAndNext(err) {
                if(err) {
                    return next(err);
                }
                delete req.body.challenge;
                delete req.body.response;
                next();
            }

            if(!conf.captcha.enabled) {
                return stripAndNext();
            }
            if(!req.body.challenge || !req.body.response) {
                return next(errBuilder.build(errBuilder.Errors.Captcha.MissingCaptcha));
            }
            getValidationFromGoogle(conf, req, res, stripAndNext);
        };
    },
    checkIfTestEmail: checkIfTestEmail
};