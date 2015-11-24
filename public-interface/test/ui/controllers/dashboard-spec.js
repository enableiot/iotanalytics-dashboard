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
describe('dashboard', function() {
    var scope,
        rootScope,
        location,
        route,
        $controllerProvider,
        mockLoginService,
        mockPollingService;
    var ipCookieMock = {};

    beforeEach(module(function ($provide) {
        $provide.value('ipCookie', ipCookieMock)
    }));
    beforeEach(module("ngRoute"));
    beforeEach(module("iotController"));
    beforeEach(module('iotServices'));

    beforeEach(inject(function($controller, $rootScope, $location, $route) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        location = $location;
        route = $route;

        rootScope.i18n = { dashboard: {}};
        $controllerProvider = $controller;

        mockPollingService = sinon.stub({startPolling: function(){},
            stopPolling: function(){}});

        mockLoginService = {
            currentUser: sinon.stub().callsArgWith(0, {
                email: "user@demo",
                accounts: {
                    "1":"admin"
                }
            })
        };
        scope.creatingAccount = true;
        scope.getUserInvites = sinon.stub();
    }));

    it('should get current user', function() {
        var ctrl = $controllerProvider("DashboardCtrl", {
            $scope: scope,
            $location: {},
            $rootScope: rootScope,
            $route: route,
            loginService: mockLoginService,
            pollerService: mockPollingService,
            alertsService: {}
        });

        expect(scope.currentUser).not.to.be.undefined;
        expect(scope.currentUser.email).to.equal("user@demo");
    });

    it('should change alert status', function() {
        // prepare
        var alert = {
                alertId: 1
            },
            alertsServiceMock = {
                updateStatus: sinon.stub().callsArgWith(1)
            };
        var ctrl = $controllerProvider('DashboardCtrl', {
            $scope: scope,
            $location: location,
            $rootScope: rootScope,
            $route: route,
            loginService: mockLoginService,
            pollerService: mockPollingService,
            alertsService: alertsServiceMock
        });

        // execute
        scope.changeAlertStatus(alert);

        // attest
        expect(alertsServiceMock.updateStatus.calledOnce).to.equal(true);
        expect(location.path()).to.equal('/alerts/edit/' + alert.alertId);
    });
});