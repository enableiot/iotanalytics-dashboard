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

var DevicesAPI = require('./devices'),
    AccountAPI = require('./accounts'),
    UsersAPI = require('./users'),
    config = require('../../../config'),
    errBuilder  = require("../../../lib/errorHandler").errBuilder,
    DataProxy = require('../../../lib/advancedanalytics-proxy').DataProxy,
    proxy = new DataProxy(config.drsProxy),
    logger = require('../../../lib/logger').init(),
    mailer = require('../../../lib/mailer'),
    valuesValidator = require('../helpers/componentValuesValidator'),
    entityProvider = require('../../../iot-entities/postgresql/index'),
    Component = entityProvider.deviceComponents,
    DeviceComponentMissingExportDays = entityProvider.deviceComponentMissingExportDays;

exports.collectData = function (options, resultCallback) {
    var deviceId = options.deviceId,
        data = options.data,
        accountId = data.accountId,
        gatewayId = options.gatewayId;
    // Since AA require the account id (that AA called public account id). It is converted.
    DevicesAPI.getDevice(deviceId, accountId, function (err, foundDevice) {
        if (!err && foundDevice && foundDevice.domainId === accountId) {
            if (foundDevice.components) {
                if (deviceId === gatewayId || foundDevice.gatewayId === gatewayId) {
                    logger.debug("Found " + foundDevice.components.length + " device components");
                    var latestObservationTimes = {};
                    var oldObservationTimes = {};
                    var currentComponents = [];
                    foundDevice.components.forEach(function (cmp) {
                        var latestObservationTime = -1;
                        data.data.forEach(function (item) {
                            logger.debug("Comparing device component - " + cmp.cid + " with component - " + item.componentId);
                            if (item.componentId === cmp.cid) {
                                if (new valuesValidator(cmp.componentType.dataType, item.value).validate() === true) {
                                    currentComponents.push({ type: cmp.type, on: item.on });
                                }
                                if (item.on > latestObservationTime) {
                                    latestObservationTime = item.on;
                                }
                                if (new Date(item.on) <= cmp.last_export_date) {
                                    if (!(cmp.cid in oldObservationTimes)) {
                                        oldObservationTimes[cmp.cid] = [];
                                    }
                                    oldObservationTimes[cmp.cid].push(item.on);
                                }
                            }
                        });
                        if (latestObservationTime > -1) {
                            latestObservationTimes[cmp.cid] = latestObservationTime;
                        }
                    });
                    if (currentComponents.length > 0) {
                        // update health total

                        // this message get to this point by REST API, we need to forward it to MQTT channel for future consumption
                        data.domainId = accountId;
                        data.gatewayId = foundDevice.gatewayId;
                        data.deviceId = deviceId;

                        var submitData = proxy.submitDataKafka;
                        if (config.drsProxy.ingestion === 'REST') {
                            submitData = proxy.submitDataREST;
                        }

                        //Connecting with AA API
                        Object.keys(latestObservationTimes).forEach(function (cid) {
                            Component.updateLastObservationTS(cid, latestObservationTimes[cid], function (err) {
                                if(err) {
                                    logger.error("Error occured when updating last observation timestamp for component " + cid + ": " + err);
                                }
                            });
                        });
                        Object.keys(oldObservationTimes).forEach(function (cid) {
                            DeviceComponentMissingExportDays.addHistoricalDaysWithDataIfNotExisting(cid, oldObservationTimes[cid], function (err) {
                                if(err) {
                                    logger.error("Error occured when adding historical dates for exporting again for component " + cid + ": " + err);
                                }
                            });
                        });
                        //Updating last visit
                        DevicesAPI.updateLastVisit(deviceId)
                            .catch(function(err) {
                               logger.warn('Error occurred while updating device lastVisit, err - ' + JSON.stringify(err));
                            });

                        logger.debug("Data to Send: " + JSON.stringify(data));
                        submitData(data, function (err) {
                            resultCallback(err);
                        });

                    } else {
                        // None of the components is registered for the device
                        resultCallback(errBuilder.build(errBuilder.Errors.Device.Component.NotFound));
                    }
                } else {
                    // Invalid GatewayId
                    resultCallback(errBuilder.build(errBuilder.Errors.Generic.NotAuthorized));
                }
            } else {
                resultCallback(errBuilder.build(errBuilder.Errors.Device.Component.NotExists));
            }
        } else {
            resultCallback(err || errBuilder.build(errBuilder.Errors.Device.NotFound));
        }
    });
};

function findDevices(accountId, targetFilter, resultCallback) {
    var searchCriteria = [];

    if (targetFilter.deviceList) {
        searchCriteria.deviceId = {operator:"in", value:targetFilter.deviceList};
    } else {
        if (targetFilter.criteria) {
            searchCriteria = targetFilter.criteria;
        } else {
            resultCallback(errBuilder.build(errBuilder.Errors.Data.InvalidData));
            return;
        }
    }
    searchCriteria.domainId = {operator:"eq", value:accountId};

    DevicesAPI.findByCriteria(searchCriteria, {}, function(err, devices) {
        resultCallback(null, devices);
    });
}

function DataInquiryResponse(data, deviceLookUp, queryMeasureLocation) {
    var _self = this;
    logger.debug("Building Response with Data: " + JSON.stringify(data));
    logger.debug("Device Lookup: " + JSON.stringify(deviceLookUp));
    _self.from = data.startDate;
    _self.to = data.endDate;
    _self.maxItems = data.maxPoints;
    _self.series = [];
    data.components.forEach(function(component) {
        var serie = {};
        if(!deviceLookUp[component.componentId]) {
            logger.warn("DataInquiryResponse. Invalid response - returned component '" + component.componentId  + "' was not present in the request");
            return;
        }
        serie.deviceId = deviceLookUp[component.componentId].id;
        serie.deviceName = deviceLookUp[component.componentId].deviceName;
        serie.componentId = component.componentId;
        serie.componentName = deviceLookUp[component.componentId].name;
        serie.componentType = deviceLookUp[component.componentId].type;
        serie.attributes = data.attributes || {};
        serie.points = [];
        component.samples.forEach(function(point) {
            if (queryMeasureLocation) {
                serie.points.push({ts:point[0], value:point[1], lat:point[2], lon:point[3], alt:point[4]});
            } else {
                serie.points.push({ts:point[0], value:point[1]});
            }
        });
        _self.series.push(serie);
    });
}

exports.search = function(accountId, searchRequest, resultCallback) {

    findDevices(accountId, searchRequest.targetFilter, function(err, resolvedDevices) {
        if (!err) {
            AccountAPI.getAccount(accountId, function(e, foundAccount){
                if (!e && foundAccount) {


                    var componentList = [];
                    var deviceLookUp = {};
                    logger.debug("resolvedDevices: " + JSON.stringify(resolvedDevices));
                    var metricsArray = searchRequest.metrics.map(function(m) {
                        return m.id;
                    });
                    logger.debug("metrics Array: " + metricsArray);
                    resolvedDevices.forEach(function(target) {
                        if (target.components) {
                            target.components.forEach(function(component) {
                                if (metricsArray.indexOf(component.cid) > -1) {
                                    componentList.push(component.cid);
                                    deviceLookUp[component.cid] = {id:target.deviceId, name: component.name, type: component.type, deviceName:target.name};
                                }
                            });
                        }
                    });

                    searchRequest.componentList = componentList;
                    searchRequest.domainId = foundAccount.public_id;
                    searchRequest.from = searchRequest.from || 0;
                    delete searchRequest.targetFilter;
                    logger.debug("search Request: " + JSON.stringify(searchRequest));
                    if (componentList.length > 0) {
                        proxy.dataInquiry(searchRequest, function(err, result) {
                            if (!err) {
                                var response = new DataInquiryResponse(result, deviceLookUp, searchRequest.queryMeasureLocation);
                                resultCallback(null, response);
                            } else if (result) {
                                resultCallback(err, result);
                            } else {
                                resultCallback(err, null);
                            }
                        });
                    } else {
                        resultCallback(null, {});
                    }
                } else {
                    resultCallback(err);
                }
            });
        } else {
            resultCallback(err);
        }
    });
};

exports.searchAdvanced = function(accountId, searchRequest, resultCallback) {
    AccountAPI.getAccount(accountId, function(e, foundAccount){
        if(!e && foundAccount) {
            searchRequest.domainId = foundAccount.public_id;

            proxy.dataInquiryAdvanced(searchRequest, function (err, result) {
                if (!err) {
                    resultCallback(null, result);
                } else if (result) {
                    resultCallback(err, result);
                } else {
                    resultCallback(err, null);
                }
            });
        } else {
            resultCallback(e);
        }
    });
};

exports.report = function(accountId, reportRequest, resultCallback) {
    AccountAPI.getAccount(accountId, function(e, foundAccount){
        if (!e && foundAccount) {
            reportRequest.domainId = foundAccount.public_id;
            proxy.report(reportRequest, function (err, result) {
                if (!err) {
                    resultCallback(null, result);
                } else {
                    resultCallback(err, null);
                }
            });
        } else {
            resultCallback(e);
        }
    });
};

exports.firstLastMeasurement = function(accountId, data, resultCallback) {
    data.domainId = accountId;

    DevicesAPI.findByAccountIdAndComponentId(accountId, data.components, function(err, device) {
        if(!err && device) {
            proxy.getFirstAndLastMeasurement(data, function (err, result) {
                if (!err) {
                    resultCallback(null, result);
                } else if (result) {
                    resultCallback(err, result);
                } else {
                    resultCallback(err, null);
                }
            });
        } else {
            resultCallback(errBuilder.build(errBuilder.Errors.Device.Component.NotFound));
        }
    });
};

var writeSeriesToCsvLines = function (series) {
    var lines = [ 'Device Id,Device Name,Component Id,Component Name,Component Type,Time Stamp,Value' ];
    if (series) {
        series.forEach(function (serie) {
            if (serie.points) {
                serie.points.forEach(function (point) {
                    lines.push([ serie.deviceId, serie.deviceName, serie.componentId, serie.componentName, serie.componentType, point.ts, point.value].join(','));
                });
            }
        });
    }
    return lines;
};

exports.exportToCsv = function(accountId, searchRequest, resultCallback) {
    this.search(accountId, searchRequest, function(err, res) {
        if (err) {
            resultCallback(err, res);
        } else {
            if (res) {
                var lines = writeSeriesToCsvLines(res.series);
                res.csv = lines.join('\n');
            }
            resultCallback(null, res);
        }
    });
};


exports.sendByEmail = function(accountId, searchRequest, resultCallback) {
    var recipients = searchRequest.recipients;
    delete searchRequest.recipients;
    if (!recipients || recipients.length === 0) {
        resultCallback(errBuilder.build(errBuilder.Errors.Data.SendByEmail.NoRecipientsProvided));
    } else {
        this.exportToCsv(accountId, searchRequest, function (err, res) {
            if (err) {
                resultCallback(err, res);
            } else {
                var subject = 'Enable IoT measures - Intel(r) Corporation';
                var attachments = [
                    { 'filename': res.from + '-' + res.to + '.csv', 'contents': res.csv }
                ];
                recipients.forEach(function (email) {
                    UsersAPI.searchUser(email, function (err, user) {
                        if (user) {
                            if (user.accounts && user.accounts[accountId]) {
                                var mail = { subject: subject, attachments: attachments, email: email };
                                logger.debug('Sending email to ' + mail.email);
                                mailer.send('measures', mail);
                            } else {
                                logger.debug('User with email ' + email + ' does not belong to account ' + accountId);
                            }
                        } else {
                            logger.debug('User with email ' + email + ' not found');
                        }
                    });
                });
                resultCallback(null);
            }
        });
    }
};

var getFromDependingOnPeriod = function(period) {
    var PERIOD_AS_SECONDS = {
        'last_year':    -3600 * 24 * 365,
        'last_month':   -3600 * 24 * 30,
        'last_week':    -3600 * 24 * 7,
        'last_day':     -3600 * 24,
        'last_hour':    -3600,
        'total':         0.0
    };
    if (PERIOD_AS_SECONDS[period]  === undefined) {
        return PERIOD_AS_SECONDS.last_hour;
    } else {
        return PERIOD_AS_SECONDS[period];
    }
};

exports.getTotals = function(accountId, period, resultCallback){
    AccountAPI.getAccount(accountId, function(e, foundAccount){
        if(!e && foundAccount) {
            var searchRequest = {
                from: getFromDependingOnPeriod(period),
                countOnly: true
            };
            searchRequest.domainId = foundAccount.public_id;

            proxy.dataInquiryAdvanced(searchRequest, function (err, result) {
                if (!err) {
                    var resp = {
                        count: result.rowCount
                    };
                    resultCallback(null, resp);
                } else if (result) {
                    resultCallback(err, result);
                } else {
                    resultCallback(err, null);
                }
            });
        } else {
            resultCallback(e);
        }
    });
};
