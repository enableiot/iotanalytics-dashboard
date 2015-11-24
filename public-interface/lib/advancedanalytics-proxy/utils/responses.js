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
var logger = require('../../logger').init();

module.exports = {
    Success: {
        OK: 200,
        Created: 201,
        Deleted: 204,
        NoContent: 204
    },

    Errors: {
        BadRequest: 400,
        EntityToLarge: 413
    },

    buildErrorMessage: function(err, res) {
        var errMsg = null;
        try {
            if (res) {
                errMsg = JSON.stringify(
                    {
                        statusCode: res.statusCode,
                        body: res.body
                    });
            } else {
                if (err) {
                    errMsg = JSON.stringify(err);
                }
            }
        } catch (error) {
            logger.debug('Unable to create error message: ' + err + ', res: ' + res);
        }

        return errMsg;
    }
};