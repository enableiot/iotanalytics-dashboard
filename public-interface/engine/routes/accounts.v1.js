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

var accounts = require ('../handlers/v1/accounts'),
    schemaValidator = require('../../lib/schema-validator'),
    schemas = require('../../lib/schema-validator/schemas'),
    VERSION = '/v1/api',
    PATH = '/accounts';

module.exports = {
    register:  function (app) {
        app.options(VERSION + PATH, accounts.usage);
        app.post(VERSION + PATH, schemaValidator.validateSchema(schemas.account.ACCOUNT), accounts.addAccount);
        app.get(VERSION + PATH + '/:accountId/activationcode', accounts.getGlobalActivationCode);
        app.get(VERSION + PATH + '/:accountId', accounts.getAccount);
        app.put(VERSION + PATH + '/:accountId/activationcode/refresh', schemaValidator.validateSchema(schemas.account.ACTIVATION_CODE), accounts.regenerateActivationCode);
        app.put(VERSION + PATH + '/:accountId', schemaValidator.validateSchema(schemas.account.UPDATE), accounts.updateAccount);
        app.delete(VERSION + PATH + '/:accountId', accounts.deleteAccount);
    }
};