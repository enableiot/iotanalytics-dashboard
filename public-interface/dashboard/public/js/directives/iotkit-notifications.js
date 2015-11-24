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
iotApp.directive('iotkitNotifications', function(){
    var link = function(scope){
        scope.notifications = scope.notifications || [];

        scope.parseTimestamp = function(ts){
            return moment(ts).fromNow();
        };

        scope.upTo = function(array, upTo){
            return array.length > upTo? array.slice(0, upTo) : array;
        };
    };

    return {
        scope: {
            notifications: '=ngModel',
            thereAreNotificationsText: '@',
            showUpTo: '@',
            acceptText: '@',
            rejectText: '@',
            changeStatus: '&'
        },
        restrict: "E",
        templateUrl: 'public/partials/directives/iotkit-notifications.html',

        link: link
    };
});
