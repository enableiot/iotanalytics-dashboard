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

describe('list devices', function () {
    var scope,
        rootScope,
        location,
        controllerProvider,
        ctrl,
        ngTableParams = function () {
        },
        ngProgressStub;

    beforeEach(module('iotController'));
    beforeEach(module('ngProgress'));

    beforeEach(inject(function ($controller, $rootScope, $location, ngProgress) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        controllerProvider = $controller;
        location = $location;

        rootScope.i18n = { device: {}};

        ngProgressStub = sinon.stub(ngProgress);
    }));

    it('should change selected menu to "devices"', function () {

        ctrl = controllerProvider('ListDevicesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: {},
            $filter: {},
            $modal: {},
            $routeParams: {},
            ngTableParams: ngTableParams,
            devicesService: {},
            ngProgress: ngProgressStub
        });

        expect(rootScope.page.menuSelected).to.equal('devices');
    });

    it('should change path when clicking add devices button', function () {

        ctrl = controllerProvider('ListDevicesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter: {},
            $modal: {},
            $routeParams: {},
            ngTableParams: ngTableParams,
            devicesService: {},
            ngProgress: ngProgressStub
        });

        location.path('/undefined');
        expect(location.path()).to.contain('/undefined');

        scope.addDevice();
        expect(location.path()).to.contain('/addDevice');
    });
});