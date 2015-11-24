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

var deviceComponentMissingExportDays = require('./models').deviceComponentMissingExportDays,
    interpreterHelper = require('../../lib/interpreter/helper'),
    async = require('async'),
    interpreter = require('../../lib/interpreter/postgresInterpreter').deviceComponentMissingExportDays();

exports.addHistoricalDaysWithDataIfNotExisting = function (componentId, dates, resultCallback) {
    async.map(dates, function changeDateToDay(date, callback) {
        var fullDate = new Date(date);
        var day = new Date(fullDate.getUTCFullYear(), fullDate.getUTCMonth(), fullDate.getUTCDate());
        var out = {
            componentId: componentId,
            day: day.getTime()
        };
        callback(null, out);
    }, function (err, historicalDates) {
        if (!err) {
            async.sortBy(historicalDates, function (model, callback) {
                callback(null, model.day);
            }, function (err, results) {
                deviceComponentMissingExportDays.findAll({where: {componentId: componentId}})
                    .then(function (alreadyExported) {
                        alreadyExported = interpreterHelper.mapAppResults(alreadyExported, interpreter);
                        var alreadyExportedDays = {};
                        async.forEach(alreadyExported, function (date, callback) {
                            alreadyExportedDays[date.day.getTime()] = true;
                            callback(null);
                        }, function (err) {
                            if (!err) {
                                var batch = [];
                                var start = 0;
                                for (var i = 0; i < results.length; i++) {
                                    if (start !== results[i].day && !(results[i].day in alreadyExportedDays)) {
                                        batch.push(results[i]);
                                        start = results[i].day;
                                    }
                                }
                                if (batch.length > 0) {
                                    deviceComponentMissingExportDays.bulkCreate(batch)
                                        .then(function () {
                                            resultCallback(null);
                                        })
                                        .catch(function (err) {
                                            resultCallback(err);
                                        });
                                } else {
                                    resultCallback(err);
                                }
                            } else {
                                resultCallback(err);
                            }
                        });
                    })
                    .catch(function (err) {
                        resultCallback(err);
                    });
            });
        } else {
            resultCallback(err);
        }
    });
};