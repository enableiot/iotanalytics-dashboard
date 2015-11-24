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

iotServices.factory('invitesService', ['$http','sessionService', function($http, sessionService){
    return {
        getInvites: function(successCallback, errorCallback){
            sessionService.addAccountIdPrefix('/invites')
                .then(function(url){
                    $http({
                        method: 'GET',
                        url: url
                    }).success(successCallback).error(errorCallback);
                });

        },
        getUserInvites: function(email, successCallback, errorCallback){
            $http({
                method: 'GET',
                url: '/v1/api/invites/'+email
            }).success(successCallback).error(errorCallback);
        },
        updateUserInvite: function(inviteId, accept, successCallback, errorCallback){
            $http({
                method: 'PUT',
                url: '/v1/api/invites/'+inviteId+'/status',
                data: accept
            }).success(successCallback).error(errorCallback);
        },
        addInvite: function(invite, successCallback, errorCallback){
            sessionService.addAccountIdPrefix('/invites/')
                .then(function(url) {
                    $http({
                        method: 'POST',
                        url: url,
                        data: invite
                    }).success(successCallback).error(errorCallback);
                });

        },
        delInvite: function (invite, successCallback, errorCallback) {
            sessionService.addAccountIdPrefix('/invites/' + invite)
                .then(function(url) {
                    $http({
                        method: 'DELETE',
                        url:url
                    }).success(successCallback).error(errorCallback);
                });
        }
    };
}
]);