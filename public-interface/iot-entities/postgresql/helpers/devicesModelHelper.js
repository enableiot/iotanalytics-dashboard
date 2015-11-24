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

var helper = require('./helper');

exports.formatDeviceAttributes = function (attributes, deviceId) {
    return Object.keys(attributes).map(function (key) {
        return {
            key: key,
            value: attributes[key],
            deviceId: deviceId
        };
    });
};

exports.formatDeviceTags = function (tags, deviceId) {
    return tags.map(function (tag) {
        return {
            value: tag,
            deviceId: deviceId
        };
    });
};

var formatDeviceComponentRow = function (columns) {
    return '"(' + columns.join() + ')"';
};

exports.formatDeviceComponents = function (components) {
    var rows = components.map(function (component) {
        return formatDeviceComponentRow([component.cid, component.name, component.type, component.deviceId]);
    });
    return '{' + rows.join() + '}';
};

exports.getIdsFromQueryResult = function (devices) {
    var ids = [];
    if (devices && Array.isArray(devices)) {
        ids = devices.map(function (device) {
            return device.id;
        });
    }
    return ids;
};

exports.formatAddComponentsResult = function (result, accountId) {

    var tagsParser = function (row, tags){
        if (row.tag_id) {
            tags[row.tag_id] = {
                value: row.tag_value
            };
        }
    };

    var attributesParser = function (row, attributes) {
        if (row.attribute_id) {
            attributes[row.attribute_id] = {
                key: row.attribute_key,
                value: row.attribute_value
            };
        }
    };

    var componentsParser = function(row, components) {
        if (row.deviceComponent_componentId) {
            components[row.deviceComponent_componentId] = {
                dataValues: {
                    componentId: row.deviceComponent_componentId,
                    name: row.deviceComponent_name,
                    deviceId: row.id,
                    componentType: {
                        dataValues: {
                            componentTypeId: row.deviceComponent_componentType_componentTypeId,
                            accountId: row.deviceComponent_componentType_accountId,
                            dimension: row.deviceComponent_componentType_dimension,
                            version: row.deviceComponent_componentType_version,
                            type: row.deviceComponent_componentType_type,
                            dataType: row.deviceComponent_componentType_dataType,
                            format: row.deviceComponent_componentType_format,
                            min: row.deviceComponent_componentType_min,
                            max: row.deviceComponent_componentType_max,
                            measureunit: row.deviceComponent_componentType_measureunit,
                            display: row.deviceComponent_componentType_display,
                            default: row.deviceComponent_componentType_default,
                            icon: row.deviceComponent_componentType_icon
                        }
                    }
                }
            };
        }
    };

    var device = null;

    if (result && Array.isArray(result) && result[0]) {
        device = {
            id: result[0].id,
            gatewayId: result[0].gatewayId,
            accountId: accountId,
            name: result[0].name,
            loc: result[0].loc,
            description: result[0].description,
            status: result[0].status,
            components: helper.parseCollection(result, componentsParser),
            tags: helper.parseCollection(result, tagsParser),
            attributes: helper.parseCollection(result, attributesParser)
        };
    }
    return device;
};

exports.createTotalsResponse = function (statistics) {
    return {
        state: {
            active: {
                total: statistics.activeDevices
            },
            created: {
                total: statistics.createdDevices
            },
            total: statistics.createdDevices + statistics.activeDevices

        },
        total: statistics.allDevices,
        current: statistics.currentDevices
    };
};
