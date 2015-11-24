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
iotApp.directive('httpEndpointHeaders', function(){
    return {
        scope : {
            attributes: '=',
            i18n: '='
        },
        restrict: "E",
        templateUrl: 'public/partials/directives/httpEndpointHeaders.html',
        transclude: true,
        link: function(scope){
            scope.newAttribute = {
                key: "",
                value: ""
            };

            scope.attributesList = [];
            for(var attrKey in scope.attributes) {
                scope.attributesList.push({ key: attrKey, value: scope.attributes[attrKey] });
            }

            scope.addAttribute = function() {
                if(scope.newAttribute.key.length > 0 && scope.newAttribute.value.length > 0){
                    if(scope.error) {
                        scope.error = "";
                    }
                    for(var i = 0; i < scope.attributesList.length; i++) {
                        if(scope.newAttribute.key === scope.attributesList[i].key) {
                            scope.error = "This key already exists.";
                            return;
                        }
                    }
                    scope.attributesList.push({ key: scope.newAttribute.key, value: scope.newAttribute.value });
                    scope.newAttribute.key = "";
                    scope.newAttribute.value= "";
                }
            };

            scope.removeAttributeRow = function(key) {
                for(var i = 0; i < scope.attributesList.length; i++) {
                    if(key === scope.attributesList[i].key) {
                        scope.attributesList.splice(i, 1);
                        break;
                    }
                }
            };

            scope.$watch('attributes', function() {
                if(scope.attributesList.length === 0) {
                    for(var attrKey in scope.attributes) {
                        scope.attributesList.push({ key: attrKey, value: scope.attributes[attrKey] });
                    }
                }
            }, true);

            scope.$watch('attributesList', function() {
                var attributesDict = {};
                for(var i = 0; i < scope.attributesList.length; i++) {
                    attributesDict[scope.attributesList[i].key] = scope.attributesList[i].value;
                }
                scope.attributes = attributesDict;
            }, true);
        }
    };
});
