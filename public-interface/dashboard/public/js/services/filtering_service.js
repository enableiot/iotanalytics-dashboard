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

var customFilter = function(filter,  property){
    return function(rule){
        var i = 0,
            length = filter.length,
            ret = false,
            currentFilter,
            currentProperty = rule[property];

        for(; i < length; i++){
            currentFilter = filter[i];
            if(currentFilter === '' || (currentProperty && currentProperty === currentFilter)){
                ret = true;
                break;
            }
        }
        return ret;
    };
};

iotServices.factory('filteringService', ['$filter', function($filter){
    return {
        filterRulesBy: function(orderedData, params){
            if (params.filter()) {
                if (params.filter().status === undefined && params.filter().priority === undefined) {
                    orderedData = $filter('filter')(orderedData, params.filter());
                } else {
                    var filter = angular.copy(params.filter()), // clone filter to avoid reload of ng-table after modifying filter structure
                        statusesToFilter = filter.status,
                        prioritiesToFilter = filter.priority;

                    delete filter.status;
                    delete filter.priority;

                    if (Object.keys(filter).length > 0) { // there are more properties to filter with
                        orderedData = $filter('filter')(orderedData, filter);
                    }
                    if (statusesToFilter) {
                        orderedData = $filter('filter')(orderedData, customFilter(statusesToFilter, 'status'));
                    }
                    if (prioritiesToFilter) {
                        orderedData = $filter('filter')(orderedData, customFilter(prioritiesToFilter, 'priority'));
                    }
                }
            }

            return orderedData;
        }
    };
}]);