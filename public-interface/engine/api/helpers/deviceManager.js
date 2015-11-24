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

var errBuilder  = require("../../../lib/errorHandler/index").errBuilder,
    postgresProvider = require('../../../iot-entities/postgresql'),
    Device = postgresProvider.devices,
    Q = require('q'),
    logger = require('../../../lib/logger/index').init();

var existInAccount = function(accountDevices, deviceId) {
    var deferred = Q.defer();

    var foundDevice = null;
    if (accountDevices && Array.isArray(accountDevices)) {
        accountDevices.forEach(function(device) {
            if (device.deviceId === deviceId) {
                foundDevice = device;
            }
        });
    }

    deferred.resolve(foundDevice);
    return deferred.promise;
};
var isDeviceActive = function(device) {
    return device.status === Device.status.active;
};

exports.isDeviceActive = isDeviceActive;

exports.isDeviceRegisteredInAccount = function(deviceId, account) {

    return existInAccount(account.devices, deviceId)
        .then(function(foundDevice) {
            if (foundDevice && isDeviceActive(foundDevice)) {
                logger.warn("Device Id exist and It's activated ");
                throw errBuilder.Errors.Device.AlreadyExists;
            }
            return foundDevice;
        });
};

exports.findTypesWithoutDefinition = function (types, componentDefinitions) {
    var typesNotFound = {};
    types.forEach(function (type) {
        var found = componentDefinitions.some(function (def) {
            return type === def.id;
        });
        if (!found) {
            typesNotFound[type] = true;
        }
    });
    return typesNotFound;
};

exports.setComponentTypeId = function(components, componentTypes) {
    if (components) {
        components.forEach(function (item) {
            var type = item.type;
            componentTypes.forEach(function (componentType) {
                if (type === componentType.id) {
                    item.componentTypeId = componentType._id;
                }
            });
        });
    }
    return components;
};

exports.removeComponentTypeId = function(components) {
    if (components) {
        components.forEach(function (item) {
            delete item.componentTypeId;
        });
    }
    return components;
};
