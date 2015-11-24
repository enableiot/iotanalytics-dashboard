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
var winston = require('winston'),
    expressWinston = require('express-winston'),
    loggerConf = require('../../config').logger,
    logLevel = require('./logLevel');

var getLogConfiguration = function (baseConfig) {
    baseConfig.level = loggerConf.logLevel;
    return baseConfig;
};

module.exports = new winston.Logger({
    transports: [
        new (winston.transports.Console) (getLogConfiguration(loggerConf.transport.console))
    ],
    levels: logLevel.levelValue,
    colors: logLevel.levelColors
});

module.exports.httpLogger = function () {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    return expressWinston.logger({
        transports: [
            new (winston.transports.Console) (getLogConfiguration(loggerConf.transport.console))
        ],
        meta: false,
        msg: " REQUESTED: {{req.url}}, {{req.method}}, requestId={{req.headers['x-iotkit-requestid']}} {{req.headers['x-intel-loglevel']}}" +
        " RESPONDED: {{req.url}}, {{req.method}}, HTTP Code: {{res.statusCode}}, requestId={{req.headers['x-iotkit-requestid']}} {{req.headers['x-intel-loglevel']}}",
        expressFormat: false,
        ignoreRoute: function () { return false; }
    });
};