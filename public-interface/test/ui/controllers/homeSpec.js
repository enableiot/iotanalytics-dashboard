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
describe('homeController', function() {
    var scope,
        rootScope,
        $controllerProvider,
        mockSummaryService,
        mockdeviceService,
        mockPollingService,
        mockUserService,
        mockDataService;

    beforeEach(module("iotController"));

    beforeEach(function(){
        module('iotServices');
        module(function($provide){
            $provide.value('ipCookie', {});
        })
    });

    beforeEach(inject(function($controller, $rootScope, devicesService) {



        rootScope = $rootScope;
        scope = $rootScope.$new();

        rootScope.i18n = { dashboard: {}};
        $controllerProvider = $controller;
        mockSummaryService = sinon.stub({getDevicesSummary: function() {},
            getMsgSummary: function(){},
            polling: function(){},
            data: {}
        });
        mockdeviceService = sinon.stub(devicesService);
        mockPollingService = sinon.stub({startPolling: function(){},
            stopPolling: function(){}});

        mockUserService = sinon.stub({
            getUserSettings: function(){}
        });
        mockDataService = sinon.stub({
            search: function(){}
        });

    }));
    it('should set the Devices as health and unhealth with default values', function() {


        var ctrl = $controllerProvider("HomeCtrl",{$scope: scope,
                                                    $rootScope: rootScope,
                                                    $modal:{},
                                                    pollerService: mockPollingService,
                                                    summaryService:mockSummaryService,
                                                    usersService: mockUserService,
                                                    dataService: mockDataService,
                                                    sessionService: {}});


        //scope.$apply();
        expect(scope.devices.total).to.equal(0);
        expect(scope.devices.current).to.equal(0);
    });
});