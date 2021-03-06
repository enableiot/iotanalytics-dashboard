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

var complexCommands = require('./models').complexCommands,
    commands = require('./models').commands,
    sequelize = require('./models').sequelize,
    interpreterHelper = require('../../lib/interpreter/helper'),
    errBuilder = require("../../lib/errorHandler/index").errBuilder,
    Q = require('q'),
    interpreter = require('../../lib/interpreter/postgresInterpreter').complexCommands();

exports.findByAccountAndId = function (accountId, id, resultCallback) {
    return complexCommands.find({where: {accountId: accountId, name: id}, include: [commands]})
        .then(function (foundComplexCommand) {
            return Q.resolve(interpreterHelper.mapAppResults(foundComplexCommand, interpreter));
        })
        .catch(function (err) {
            throw err;
        })
        .nodeify(resultCallback);
};

exports.findAllByAccount = function (accountId, resultCallback) {
    return complexCommands.findAll({where: {accountId: accountId}, include: [commands]})
        .then(function (foundComplexCommand) {
            return Q.resolve(interpreterHelper.mapAppResults(foundComplexCommand, interpreter));
        })
        .catch(function (err) {
            throw err;
        })
        .nodeify(resultCallback);
};

exports.update = function (data, resultCallback) {
    data.commands.forEach(function (c) {
        c.accountId = data.accountId;
    });

    var componentModel = interpreter.toDb(data);
    return sequelize.transaction()
        .then(function (t) {
            return complexCommands.update(componentModel, {where: {accountId: componentModel.accountId, name: componentModel.name }, returning: true }, {transaction: t})
                .then(function (foundComplexCommand) {
                    if (foundComplexCommand && foundComplexCommand[1][0]) {
                        return commands.destroy({where: {complexCommandId: foundComplexCommand[1][0].dataValues.id}}, {transaction: t})
                            .then(function () {
                                data.commands.forEach(function (c) {
                                    c.complexCommandId = foundComplexCommand[1][0].dataValues.id;
                                });
                                return commands.bulkCreate(data.commands, {transaction: t})
                                    .then(function () {
                                        t.commit();
                                    });
                            });
                    }
                    else {
                        throw errBuilder.build(errBuilder.Errors.ComplexCommand.DoesNotExist);
                    }
                })
                .catch(function (err) {
                    t.rollback();
                    throw err;
                });
        })
        .nodeify(resultCallback);
};

exports.insert = function (data, resultCallback) {
    data.commands.forEach(function (c) {
        c.accountId = data.accountId;
    });

    var componentModel = interpreter.toDb(data);
    return sequelize.transaction()
        .then(function (t) {
            return complexCommands.create(componentModel, {transaction: t})
                .then(function (complexCommand) {
                    data.commands.forEach(function (c) {
                        c.complexCommandId = complexCommand.dataValues.id;
                    });
                    return commands.bulkCreate(data.commands, {transaction: t})
                        .then(function () {
                            t.commit();
                        });
                }).
                catch(function (err) {
                    t.rollback();
                    if (err.name === errBuilder.SqlErrors.AlreadyExists) {
                        throw errBuilder.build(errBuilder.Errors.ComplexCommand.AlreadyExists);
                    }
                    else {
                        throw err;
                    }
                });
        })
        .nodeify(resultCallback);
};

exports.delete = function (accountId, id, resultCallback) {
    return complexCommands.destroy({where: {accountId: accountId, name: id}})
        .then(function (res) {
            return res;
        })
        .catch(function (err) {
            throw err;
        })
        .nodeify(resultCallback);
};

exports.deleteAllByAccount = function (accountId, resultCallback) {
    return complexCommands.destroy({where: {accountId: accountId}})
        .then(function (res) {
            return res;
        })
        .catch(function (err) {
            throw err;
        })
        .nodeify(resultCallback);
};
