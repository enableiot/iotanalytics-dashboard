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

var deviceComponents = require('./models').deviceComponents,
    componentTypes = require('./models').componentTypes,
    deviceTags = require('./models').deviceTags,
    devices = require('./models').devices,
    interpreterHelper = require('../../lib/interpreter/helper'),
    interpreter = require('../../lib/interpreter/postgresInterpreter').deviceComponents(),
    Q = require('q');

var filterByAccountId = function(accountId) {
    return {
        include: [
            {model: componentTypes, as: 'componentType'},
            {
                model: devices,
                where: {
                    $and: {
                        accountId: accountId
                    }
                },
                attributes: []
            }
        ]
    };
};

exports.all = function (accountId, resultCallback) {
    var filter = filterByAccountId(accountId);
    deviceComponents.all(filter)
        .then(function (result) {
            interpreterHelper.mapAppResults(result, interpreter, resultCallback);
        })
        .catch (function(err) {
            resultCallback(err);
    });
};

var filterByDeviceProperties = function (customFilter, filter) {
    if (customFilter.deviceNames) {
        filter.include[1].where.$and.name = {
            $in: customFilter.deviceNames
        };
    }
    if (customFilter.deviceIds) {
        filter.include[1].where.$and.id = {
            $in: customFilter.deviceIds
        };
    }
    if (customFilter.gatewayIds) {
        filter.include[1].where.$and.gatewayId = {
            $in: customFilter.gatewayIds
        };
    }
    if (customFilter.deviceTags) {
        filter.include[1].include = [
            {
                model: deviceTags,
                as: 'tags',
                where: {
                    value: {
                        $in: customFilter.deviceTags
                    }
                },
                attributes: []
            }
        ];
    }
};
var filterByComponentIds = function (customFilter, filter) {
    if (customFilter.componentIds) {
        filter.where = {
            componentId: {
                $in: customFilter.componentIds
            }
        };
    }
};
exports.getByCustomFilter = function(accountId, customFilter, resultCallback) {
    var filter = filterByAccountId(accountId);
    filterByComponentIds(customFilter, filter);
    filterByDeviceProperties(customFilter, filter);

    deviceComponents.all(filter)
        .then(function (result) {
            interpreterHelper.mapAppResults(result, interpreter, resultCallback);
        })
        .catch (function(err) {
            console.log(err);
            resultCallback(err);
    });
};

exports.updateLastObservationTS = function (componentId, date, resultCallback) {
    var filter = {
        where: {
            componentId: componentId
        }
    };
    deviceComponents.find(filter).then(function (comp) {
        filter.where.last_observation_time = {
            $lt: new Date(date)
        };
        comp = interpreterHelper.mapAppResults(comp, interpreter);
        if (date > comp.last_observation_time) {
            comp.last_observation_time = date;
            deviceComponents.update(comp, filter)
                .then(function () {
                    return Q.resolve();
                })
                .catch(function (err) {
                    throw err;
                }).nodeify(resultCallback);
        } else {
            Q.resolve();
        }
    }).catch(function (err) {
        throw err;
    }).nodeify(resultCallback);
};
