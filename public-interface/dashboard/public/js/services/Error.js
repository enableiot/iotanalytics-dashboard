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
iotServices.factory('Error', [function() {
    function createCodeHashTable(self, errorsObject){
        for(var i in errorsObject){
            if(errorsObject[i].code !== undefined){
                self.codeHashTable[errorsObject[i].code] = errorsObject[i].message;
            } else {
                createCodeHashTable(self, errorsObject[i]);
            }
        }
    }
    function Error(i18n){
        this.codeHashTable = [];
        createCodeHashTable(this, i18n.api_errors);
    }
    Error.prototype = {
        getMessageByCode: function (code) {
            return this.codeHashTable[code];
        }
    };
    return Error;
}]);