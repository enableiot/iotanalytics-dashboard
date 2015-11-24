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
describe('list alerts', function() {
    var scope,
        rootScope,
        location,
        controllerProvider,
        ctrl,
        ngTableParams = function () {
            this.reload = sinon.spy();
        },
        ngProgressStub;

    var ModalMock = function () {
        var self = this;
        this.open = function (config) {
            return {
                result: {
                    config: config,
                    then: function (confirm, cancel) {
                        self.confirm = confirm;
                        self.cancel = cancel;
                    }
                },
                close: function (res) {
                    if (self.confirm) {
                        self.confirm(res);
                    }
                },
                dismiss: function () {
                    if (self.cancel) {
                        self.cancel();
                    }
                }
            };
        };
    };

    beforeEach(module('iotController'));
    beforeEach(module('ngProgress'));

    beforeEach(inject(function ($controller, $rootScope, $location, ngProgress) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.$parent = {
            i18n:{
                alerts:{
                    title:'test',
                    errors: {
                        updateAlerts: 'test'
                    }
                }
            }
        }
        scope.$on = function(value, callback) { };
        controllerProvider = $controller;
        location = $location;
        ngProgressStub = sinon.stub(ngProgress);
    }));

    it('should change selected menu to "alerts"', function(){
        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: {},
            $q: {},
            alertsService: {},
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        expect(scope.$parent.page.menuSelected).to.equal('alerts');
    });

    it('should create "alerts" model with no alerts', function(){
        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: {},
            $q: {},
            alertsService: {},
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        expect(scope.alerts.length).to.equal(0);
    });

    it('should return status to filter with', function(){
        // prepare
        var defMock = {
                resolve: sinon.spy()
            },
            qMock = {
                defer: sinon.stub()
            };

        qMock.defer.withArgs().returns(defMock);

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: {},
            $q: qMock,
            alertsService: {},
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        scope.getStatusesToFilterWith();

        // assert
        expect(qMock.defer.calledOnce).to.equal(true);
        expect(defMock.resolve.calledOnce).to.equal(true);
        expect(defMock.resolve.args[0].length).to.equal(1);
        var actual = defMock.resolve.args[0][0];
        expect(actual.length).to.equal(3);
        expect(actual[0].id).to.equal('New');
        expect(actual[0].title).to.equal('New');
        expect(actual[1].id).to.equal('Open');
        expect(actual[1].title).to.equal('Open');
        expect(actual[2].id).to.equal('Closed');
        expect(actual[2].title).to.equal('Closed');
    });

    it('should return priorities to filter with', function(){
        // prepare
        var defMock = {
                resolve: sinon.spy()
            },
            qMock = {
                defer: sinon.stub()
            };

        qMock.defer.withArgs().returns(defMock);

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: {},
            $q: qMock,
            alertsService: {},
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        scope.getPrioritiesToFilterWith();

        // assert
        expect(qMock.defer.calledOnce).to.equal(true);
        expect(defMock.resolve.calledOnce).to.equal(true);
        expect(defMock.resolve.args[0].length).to.equal(1);
        var actual = defMock.resolve.args[0][0];
        expect(actual.length).to.equal(3);
        expect(actual[0].id).to.equal('High');
        expect(actual[0].title).to.equal('High');
        expect(actual[1].id).to.equal('Medium');
        expect(actual[1].title).to.equal('Medium');
        expect(actual[2].id).to.equal('Low');
        expect(actual[2].title).to.equal('Low');
    });

    it('should change status of given alert if user confirms the change - to open', function(){
        // prepare
        var alert = {
                alertId: 1
            },
            newStatus = 'Open',
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(1),
                reset: sinon.spy()
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        var modalInstance = scope.changeStatus(alert, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, alert, newStatus);
        scope.confirm();

        // assert
        expect(serviceMock.reset.calledOnce).to.equal(false);
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(serviceMock.updateStatus.args[0].length).to.equal(3);
        expect(serviceMock.updateStatus.args[0][0].alert.alertId).to.equal(alert.alertId);
        expect(serviceMock.updateStatus.args[0][0].newStatus).to.equal(newStatus);
        expect(scope.tableAlerts.reload.calledOnce).to.equal(true);
        expect(scope.error).to.be.null;
    });

    it('should change status of given alert if user confirms the change - to new', function(){
        // prepare
        var alert = {
                alertId: 1
            },
            newStatus = 'Open',
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(1),
                reset: sinon.spy()
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        var modalInstance = scope.changeStatus(alert, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, alert, newStatus);
        scope.confirm();

        // assert
        expect(serviceMock.reset.calledOnce).to.equal(false);
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(serviceMock.updateStatus.args[0].length).to.equal(3);
        expect(serviceMock.updateStatus.args[0][0].alert.alertId).to.equal(alert.alertId);
        expect(serviceMock.updateStatus.args[0][0].newStatus).to.equal(newStatus);
        expect(scope.tableAlerts.reload.calledOnce).to.equal(true);
        expect(scope.error).to.be.null;
    });

    it('should not change status of given alert if user cancels the change', function(){
        // prepare
        var alert = {
                alertId: 1
            },
            newStatus = 'Open',
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(1),
                reset: sinon.spy()
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        var modalInstance = scope.changeStatus(alert, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, alert, newStatus);
        scope.cancel();

        // assert
        expect(serviceMock.reset.calledOnce).to.equal(false);
        expect(serviceMock.updateStatus.calledOnce).to.equal(false);
        expect(scope.tableAlerts.reload.calledOnce).to.equal(false);
        expect(scope.error).to.be.null;
    });

    it('should not change status of given alert if user cancels the change', function(){
        // prepare
        var alert = {
                alertId: 1
            },
            newStatus = 'Open',
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(1),
                reset: sinon.spy()
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        var modalInstance = scope.changeStatus(alert, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, alert, newStatus);
        scope.cancel();

        // assert
        expect(serviceMock.reset.calledOnce).to.equal(false);
        expect(serviceMock.updateStatus.calledOnce).to.equal(false);
        expect(scope.tableAlerts.reload.calledOnce).to.equal(false);
        expect(scope.error).to.be.null;
    });

    it('should reset given alert if user confirms the change', function(){
        // prepare
        var alert = {
                alertId: 1
            },
            newStatus = 'Closed',
            serviceMock = {
                updateStatus: sinon.spy(),
                reset: sinon.stub().callsArgWith(1)
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        var modalInstance = scope.changeStatus(alert, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, alert, newStatus);
        scope.confirm();

        // assert
        expect(serviceMock.updateStatus.calledOnce).to.equal(false);
        expect(serviceMock.reset.calledOnce).to.equal(true);
        expect(serviceMock.reset.args[0].length).to.equal(3);
        expect(serviceMock.reset.args[0][0].alert.alertId).to.equal(alert.alertId);
        expect(scope.tableAlerts.reload.calledOnce).to.equal(true);
        expect(scope.error).to.be.null;
    });

    it('should not change status of given alert if something goes wrong', function(){
        // prepare
        var alert = {
                alertId: 1
            },
            newStatus = 'Open',
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(2), // trigger an error
                reset: sinon.spy()
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        var modalInstance = scope.changeStatus(alert, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, alert, newStatus);
        scope.confirm();

        // assert
        expect(serviceMock.reset.calledOnce).to.equal(false);
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(scope.tableAlerts.reload.calledOnce).to.equal(false);
        expect(scope.error).to.equal(scope.$parent.i18n.alerts.errors.updateAlerts);
    });

    it('should open details of given alert - status = New - status changed successfully', function(){
        // prepare
        var alert = {
                alertId: 10,
                status: 'New'
            },
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(1)
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: location,
            $filter:{},
            $modal: {},
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        scope.openDetails(alert);

        // attest
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(location.path()).to.contain('/alerts/edit/' + alert.alertId);
    });

    it('should open details of given alert - status = New - status changed failed', function(){
        // prepare
        var alert = {
                alertId: 10,
                status: 'New'
            },
            serviceMock = {
                updateStatus: sinon.stub().callsArgWith(2)
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: location,
            $filter:{},
            $modal: {},
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        scope.openDetails(alert);

        // attest
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(location.path()).to.contain('/alerts/edit/' + alert.alertId);
    });

    it('should open details of given alert - status != New', function(){
        // prepare
        var alert = {
                alertId: 10,
                status: 'Closed'
            },
            serviceMock = {
                updateStatus: sinon.spy()
            };

        ctrl = controllerProvider('ListAlertsCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: location,
            $filter:{},
            $modal: {},
            $q: {},
            alertsService: serviceMock,
            orderingService: {},
            filteringService: {},
            sessionService: {},
            ngTableParams: ngTableParams,
            ngProgress: ngProgressStub
        });

        // execute
        scope.openDetails(alert);

        // attest
        expect(serviceMock.updateStatus.calledOnce).to.equal(false);
        expect(location.path()).to.contain('/alerts/edit/' + alert.alertId);
    });
});