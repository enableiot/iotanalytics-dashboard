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

iotServices.factory('accountsService', ['$http', function($http){
    return {
        getAccount: function(accountId, successCallback, errorCallback){
            $http({
                method: 'GET',
                url: '/v1/api/accounts/'+accountId
            })
                .success(function(data, status){
                    successCallback(data, status);
                }).error(function(data, status){
                    errorCallback(data, status);
                });
        },
        addAccount: function(account, successCallback, errorCallback){
            $http({
                method: 'POST',
                url: '/v1/api/accounts/',
                data: account
            })
                .success(function(data, status){
                    successCallback(data, status);
                }).error(function(data, status){
                    errorCallback(data, status);
                });
        },
        updateAccount: function(id, account, successCallback, errorCallback){
            $http({
                method: 'PUT',
                url: '/v1/api/accounts/'+id,
                data: account
            })
                .success(function(data, status){
                    successCallback(data, status);
                }).error(function(data, status){
                    errorCallback(data, status);
                });
        },
        updateAttributes: function(id, account, successCallback, errorCallback){
            var data = {
                attributes: account.attributes
            };
            $http({
                method: 'PUT',
                url: '/v1/api/accounts/'+id+'/attributes',
                data: data
            })
                .success(function(data, status){
                    successCallback(data, status);
                }).error(function(data, status){
                    errorCallback(data, status);
                });
        },
        deleteAccount: function(accountId, successCallback, errorCallback){
            $http({
                method: 'DELETE',
                url: '/v1/api/accounts/'+accountId
            })
                .success(successCallback)
                .error(errorCallback);
        },
        getActivationCode: function(domid, callback){
            $http({
                method: 'GET',
                url: '/v1/api/accounts/'+ domid +'/activationcode'
            }).success( function (data) {
                callback(null, data);
            }).error(function (err) {
                callback(err);
            });
        },
        refreshActivationCode: function (domid, callback) {
            $http({
                method: 'PUT',
                url: '/v1/api/accounts/'+ domid +'/activationcode/refresh'
            }).success( function (data) {
                callback(null, data);
            }).error(function (err) {
                callback(err);
            });
        }
    };
}
]);