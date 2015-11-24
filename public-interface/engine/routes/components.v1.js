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

var components = require('../handlers/v1/components'),
    schemaValidator = require('../../lib/schema-validator'),
    schemas = require('../../lib/schema-validator/schemas'),
    VERSION = '/v1/api',
    PATH = '/cmpcatalog',
    FULL_PATH = '/accounts/:accountId/cmpcatalog';

function postSchemaSelector(req){
    if(req.body && req.body.type === "actuator"){
        return schemas.component.POST_ACTUATOR;
    }else{
        return schemas.component.POST;
    }
}

function putSchemaSelector(req){
    if(req.body && req.body.type === "actuator"){
        return schemas.component.PUT_ACTUATOR;
    }else{
        return schemas.component.PUT;
    }
}

module.exports = {
    register: function(app){
        app.options(VERSION + PATH, components.usage);
        app.options(VERSION + FULL_PATH, components.usage);

        app.get(VERSION + PATH, components.getComponents);
        app.get(VERSION + FULL_PATH, components.getComponents);

        app.get(VERSION + PATH + '/:componentId', components.getComponent);
        app.get(VERSION + FULL_PATH + '/:componentId', components.getComponent);

        app.post(VERSION + FULL_PATH, schemaValidator.validateDynamicSchema(postSchemaSelector), components.addComponent);

        app.put(VERSION + FULL_PATH + '/:componentId', schemaValidator.validateDynamicSchema(putSchemaSelector), components.updateComponent);
    }
};