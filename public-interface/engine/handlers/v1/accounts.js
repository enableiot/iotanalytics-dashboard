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

var account = require('../../api/v1/accounts'),
    Response = require('../../../lib/response').response,
    httpStatuses = require('../../res/httpStatuses'),
    errBuilder = require('../../../lib/errorHandler/index').errBuilder,
    attributesValidation = require('../helpers/attributesValidation');

exports.usage = function(req, res, next){
    var responder = new Response(res, next);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    responder(httpStatuses.OK.code);
};

var asAccountDTO = function(account){
    account.id = account.public_id;
    delete account.public_id;

    return account;
};

exports.addAccount = function (req, res, next) {
    var data = req.body;
    var responder = new Response(res, next);
    if(!data || !data.name || !req.identity){
        responder(errBuilder.build(errBuilder.Errors.Account.InvalidData));
        return;
    }
    attributesValidation.checkLimitsForAttributes(data.attributes, function(err) {
        if(!err) {
            account.addAccountWithGlobalCode(data, req.identity, function (err, dom) {
                if (!err) {
                    responder(httpStatuses.Created.code, asAccountDTO(dom));
                } else {
                    responder(err);
                }
            });
        } else {
            responder(httpStatuses.BadRequest.code, err);
        }
    });
};

function convertToActCodeObj (ob) {
    var data = {
        activationCode: null,
        timeLeft: null
    };

    if (ob) {
        data.activationCode = ob.id;
        data.timeLeft = Math.round(ob.expire / 1000);
    }
    return data;
}

exports.regenerateActivationCode = function (req, res, next) {
    var responder = new Response(res, next);
    var accId = req.params.accountId;
    account.regenerateActivationCode(accId, function(err, code){
        if(!err) {
            responder(httpStatuses.OK.code, convertToActCodeObj(code));
        } else {
            responder(err);
        }
    });
};
exports.getGlobalActivationCode = function (req, res, next) {
    var responder = new Response(res, next);
    var accId = req.params.accountId;
    account.getActivationCode(accId, function (err, code){
        if(!err) {
            responder(httpStatuses.OK.code, convertToActCodeObj(code));
        } else {
            responder(err);

        }
    });
};

exports.getAccount = function (req, res, next) {
    var responder = new Response(res, next);

    if(!req.params.accountId){
        responder(errBuilder.Errors.Generic.InvalidRequest.code,errBuilder.Errors.Generic.InvalidRequest.message);
    }
    else {
        account.getAccount(req.params.accountId, function(err, acc){
            if(!err){
                responder(httpStatuses.OK.code, asAccountDTO(acc));
            } else {
                responder(err);
            }
        });
    }
};

exports.updateAccount = function (req, res, next) {
    var data = req.body;
    delete data.activation_code;
    delete data.activation_code_expire_date;
    var responder = new Response(res, next);

    if(!data || !data.name || !req.params.accountId){
        responder(errBuilder.Errors.Generic.InvalidRequest.code,errBuilder.Errors.Generic.InvalidRequest.message);
    }
    else {
        data.public_id = req.params.accountId;
        if(!data.id) {
            data.id = data.public_id;
        }

        data.updated = Date.now();
        delete data.created;

        attributesValidation.checkLimitsForAttributes(data.attributes, function(err) {
            if(!err) {
                account.updateAccount(data, function (err, acc) {
                    if (!err) {
                        responder(httpStatuses.OK.code, asAccountDTO(acc));

                    } else {
                        responder(err);
                    }
                });
            } else {
                responder(httpStatuses.BadRequest.code, err);
            }
        });
    }
};

exports.updateAttributes = function (req, res, next) {
    var data = req.body;
    var responder = new Response(res, next);

    if(!data || !data.attributes || !req.params.accountId){
        responder(errBuilder.Errors.Generic.InvalidRequest.code,errBuilder.Errors.Generic.InvalidRequest.message);
    } else {
        data.public_id = req.params.accountId;
        attributesValidation.checkLimitsForAttributes(data.attributes, function(err) {
            if(!err) {
                account.updateAttributes(data, function(err){
                    if(!err){
                        responder(httpStatuses.OK.code);

                    } else {
                        responder(err);

                    }
                });
            } else {
                responder(httpStatuses.BadRequest.code, err);
            }
        });
    }
};

exports.deleteAccount = function (req, res, next) {
    var responder = new Response(res, next);

    var accountId = req.params.accountId;
    account.delete(accountId, function(err) {
        if(!err) {
            responder(httpStatuses.DeleteOK.code);

        } else {
            responder(err);

        }
    });
};