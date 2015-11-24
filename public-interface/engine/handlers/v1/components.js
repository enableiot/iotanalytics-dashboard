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
var components = require('../../api/v1/components'),
    Response = require('../../../lib/response').response,
    httpStatuses = require('../../res/httpStatuses'),
    errors = require('../../../lib/errorHandler/index').errBuilder.Errors,
    logger = require('../../../lib/logger/index').init(),
    requestParser = require('../helpers/requestParser');

var usage = function(req, res){
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.status(httpStatuses.OK.code).send();
};

var getComponents = function(req, res, next){
    var url = req.forwardedHeaders.baseUrl + req.url,
        responder = new Response(res, next),
        accountId = requestParser.getAccountIdFromReq(req);
    
    if(!accountId){
        responder(errors.build(errors.Generic.NotAuthorized));
        return;
    }
    components.getComponents(accountId, url, req.query.full, function(err, components){
        if(!err){
            responder(httpStatuses.OK.code, components);
        } else {
            responder(err);
        }
    });
};

var getComponent = function(req, res, next){
    var accountId = requestParser.getAccountIdFromReq(req),
        responder = new Response(res, next);
    if(!accountId) {
        responder(errors.build(errors.Generic.NotAuthorized));
        return;
    }

    var options = {
        compId: req.params.componentId,
        accountId: accountId,
        url: req.forwardedHeaders.baseUrl + req.url
    };

    components.getComponent(options, function(err, comp){
        if(!err){
            responder(httpStatuses.OK.code, comp);
        } else {
            responder(err);
        }
    });
};

var addComponent = function(req, res, next){
    var options = {
        component: req.body,
        accountId: req.params.accountId,
        baseUrl: req.forwardedHeaders.baseUrl + req.url
    };
    var responder = new Response(res, next);
    components.addComponent(options, function(err, comp) {
        if(!err) {
            logger.info("Success Add Component Registration " + JSON.stringify(comp));
            responder(httpStatuses.Created.code, comp);
        } else {
            logger.error("Add Component Registration " + JSON.stringify(err));
            responder(err);
        }
    });
};

var updateComponent = function(req, res, next){
    var options = {
        compId: req.params.componentId,
        componentToUpdate: req.body,
        accountId: req.params.accountId,
        baseUrl: req.forwardedHeaders.baseUrl + req.url.substring(0, req.url.indexOf(req.params.componentId) - 1)
    };
    var responder = new Response(res, next);
    components.updateComponent(options, function(err, comp){
        if(!err){
            responder(httpStatuses.Created.code, comp);
        } else {
            responder(err);
        }
    });
};

module.exports = {
    usage: usage,
    getComponents: getComponents,
    getComponent: getComponent,
    addComponent: addComponent,
    updateComponent: updateComponent
};