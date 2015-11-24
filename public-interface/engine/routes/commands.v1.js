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

var commands = require('../handlers/v1/commands'),
    schemaValidator = require('../../lib/schema-validator'),
    schemas = require('../../lib/schema-validator/schemas'),
    VERSION = '/v1/api',
    PATH = '/accounts/:accountId/control';

module.exports = {
    register: function(app){
        app.post(VERSION + PATH, schemaValidator.validateSchema(schemas.command.POST_SEND_COMPLEX_COMMAND), commands.command);
        app.post(VERSION + PATH + '/commands/:commandName', schemaValidator.validateSchema(schemas.command.POST), commands.addComplexCommand);
        app.put(VERSION + PATH + '/commands/:commandName', schemaValidator.validateSchema(schemas.command.POST), commands.updateComplexCommand);
        app.get(VERSION + PATH + '/commands', commands.getComplexCommands);
        app.get(VERSION + PATH + '/devices/:deviceId', commands.getCommands);
        app.delete(VERSION + PATH + '/commands/:commandName', commands.deleteComplexCommand);
    }
};