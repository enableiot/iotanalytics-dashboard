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

var entityProvider = require('../../../iot-entities/postgresql/index'),
    Component = entityProvider.componentTypes,
    errBuilder = require("../../../lib/errorHandler/index").errBuilder,
    async = require("async"),
    Q = require('q'),
    versionPattern = /^([0-9]+)\.([0-9]+)$/,
    urlPattern = /^.*\?/;

function validateCommandValues(component, validationCallback) {
    component.dimension = component.dimension.trim();
    if (!component.dimension) {
        validationCallback(errBuilder.build(errBuilder.Errors.Component.InvalidData));
    } else if (component.type === "actuator") {
        async.each(component.command.parameters, function (parameter, callback) {
            if (!parameter.name || 0 === parameter.name.length) {
                callback(errBuilder.build(errBuilder.Errors.Component.InvalidParameterName));
            } else if (!parameter.values || 0 === parameter.values.length) {
                callback(errBuilder.build(errBuilder.Errors.Component.InvalidParameterValues));
            } else {
                var matches = parameter.values.match(/-/g);
                var rangeValues = parameter.values.split("-");
                if (matches && matches.length === 1 && !isNaN(rangeValues[0]) && !isNaN(rangeValues[1])) {
                    parameter.display = "slider";
                }
                else {
                    var commaMatches = parameter.values.match(/,/g);
                    if (commaMatches && commaMatches.length === 1) {
                        parameter.display = "switcher";
                    } else if (commaMatches && commaMatches.length > 1) {
                        parameter.display = "list";
                    } else {
                        parameter.display = "text";
                    }
                }
                callback();
            }
        }, validationCallback);
    } else {
        validationCallback();
    }
}

var addHRef = function (comp, baseUrl) {
    var matches = baseUrl.match(urlPattern);

    if(matches && matches[0]){
        comp.href = matches[0].slice(0,-1) + '/' + comp.id;
    }
    else {
        comp.href = baseUrl + '/' + comp.id;
    }

    return comp;
};

var getComponents = function (accountId, baseUrl, full, callback) {
    return Component.all(accountId, full)
        .then(function (components) {
            callback(null, components.map(function (c) {
                return addHRef(c, baseUrl);
            }));
        })
        .catch(function () {
            callback(errBuilder.build(errBuilder.Errors.Component.NotFound));
        });
};

var getComponent = function (options, callback) {
    options.compId = options.compId.toLowerCase();
    return Component.findByIdAndAccount(options.compId, options.accountId)
        .then(function (compFound) {
            if (options.url) {
                compFound.href = options.url;
            }
            callback(null, compFound);
        })
        .catch(function () {
            callback(errBuilder.build(errBuilder.Errors.Component.NotFound));
        });
};

var buildId = function (dimension, version) {
    return dimension + '.v' + version;
};

var addComponent = function (options, callback) {
    options.component.id = buildId(options.component.dimension, options.component.version);
    options.component.id = options.component.id.toLowerCase();
    options.component.domainId = options.accountId;

    return Q.nfcall(validateCommandValues, options.component)
        .then(function () {
            return Component.new(options.component)
                .then(function (addedComp) {
                    callback(null, addHRef(addedComp, options.baseUrl));
                });
        })
        .catch(function (err) {
            if (err && err.code) {
                callback(err);
            }
            else {
                callback(errBuilder.build(errBuilder.Errors.Component.InvalidData));
            }
        });
};

var merge = function (to, from) {
    for (var i in from) {
        if (from.hasOwnProperty(i) && to[i] === undefined) {
            to[i] = from[i];
        }
    }
    return to;
};

var getMaxMinorVersion = function (components, componentId) {
    var matches = componentId.match(versionPattern),
        currentMajor = parseInt(matches[1]);

    return Math.max.apply(Math, components.map(function (c) {
        var matches = c.version.match(versionPattern),
            major = parseInt(matches[1]),
            minor = parseInt(matches[2]);

        return (currentMajor === major) ? minor : 0;
    }));
};

var incrementMinorVersion = function (version, minor) {
    var matches = version.match(versionPattern),
        major = matches[1];

    return major + '.' + (minor + 1).toString();
};

var updateComponent = function (options, callback) {
    options.compId = options.compId.toLowerCase();
    return entityProvider.startTransaction()
        .then(function (transaction) {
            return Component.findByIdAndAccount(options.compId, options.accountId, transaction)
                .then(function (compFound) {
                    return Component.findByDimensionAndAccount(compFound.dimension, options.accountId, transaction)
                        .then(function (componentWithLatestVersion) {
                            if (componentWithLatestVersion.length === 0) {
                                throw errBuilder.build(errBuilder.Errors.Component.NotFound);
                            }

                            var maxMinor = getMaxMinorVersion(componentWithLatestVersion, compFound.version);
                            var newComp = merge(options.componentToUpdate, compFound);
                            newComp.version = incrementMinorVersion(newComp.version, maxMinor);
                            newComp.id = buildId(newComp.dimension, newComp.version);
                            newComp.domainId = options.accountId;
                            newComp.on = new Date().getTime();
                            return Q.nfcall(validateCommandValues, newComp)
                                .then(function () {
                                    return Component.new(newComp, transaction)
                                        .then(function (addedComp) {
                                            entityProvider.commit(transaction);
                                            callback(null, addHRef(addedComp, options.baseUrl));
                                        });
                                });
                        });
                })
                .catch(function(err) {
                    entityProvider.rollback(transaction);
                    var errMsg = errBuilder.Errors.Component.InvalidData;
                    if (err && err.code) {
                        errMsg = errBuilder.build(err);
                    }
                    callback(errMsg);
                });
        });
};


module.exports = {
    getComponents: getComponents,
    getComponent: getComponent,
    addComponent: addComponent,
    updateComponent: updateComponent
};
