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

describe('edit alert', function() {
    var scope,
        rootScope,
        location,
        controllerProvider,
        ctrl,
        rulesServiceMock = {
            getRuleById: sinon.spy()
        };

    beforeEach(module('iotController'));

    beforeEach(inject(function ($controller, $rootScope, $location) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.$parent = {
            i18n:{
                alerts:{
                    title:'test',
                    errors: {
                        loadAlerts: 'test',
                        updateAlerts: 'test'
                    }
                }
            }
        };
        controllerProvider = $controller;
        location = $location;
    }));

    it('should change selected menu to "alerts" and other initializations', function(){
        // prepare
        var serviceMock = {
            getAlert: sinon.spy()
        };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // attest
        expect(scope.$parent.page.menuSelected).to.equal('alerts');
        expect(scope.statusEdit).to.equal(false);
        expect(scope.error).to.equal(null);
        expect(scope.alert).to.equal(null);
        expect(scope.currentComment).to.equal(null);
        expect(scope.addingComment).to.equal(false);
        expect(scope.comments.length).to.equal(0);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
    });

    it('should request given alert at initialization', function(){
        // prepare
        var alert = {
                alertId: 1,
                status: 'Open',
                comments: [{}]
            },
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert)
            },
            routeParamsMock = {
                alertId: alert.alertId
            };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: routeParamsMock,
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // attest
        expect(scope.alert.alertId).to.equal(alert.alertId);
        expect(scope.error).to.equal(null);
        expect(scope.comments.length).to.equal(1);
        expect(scope.currentStatus.name).to.equal(alert.status);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
    });

    it('should request given alert at initialization - request failed', function(){
        // prepare
        var alert = {
                alertId: 1,
                status: 'Open',
                comments: [{}]
            },
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(2)
            },
            routeParamsMock = {
                alertId: alert.alertId
            };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: routeParamsMock,
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // attest
        expect(scope.alert).to.equal(null);
        expect(scope.error).to.equal(scope.$parent.i18n.alerts.errors.loadAlerts);
        expect(scope.comments.length).to.equal(0);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
    });

    it('should add a comment when requested by user', function(){
        // prepare
        var user = {
                email: 'user1@mail.com'
            },
            alert = {
                alertId: 1
            },
            comment = Math.random().toString(),
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert),
                addComments: sinon.stub().callsArgWith(1)
            };

        scope.$root = { currentUser: user };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.addComment(comment);

        // attest
        expect(scope.comments.length).to.equal(1);
        expect(scope.comments[0].text).to.equal(comment);
        expect(scope.currentComment).to.equal(null);
        expect(scope.addingComment).to.equal(false);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
        expect(serviceMock.addComments.calledOnce).to.equal(true);
    });

    it('should add a comment when requested by user (only at memory) - request failed', function(){
        // prepare
        var user = {
                email: 'user1@mail.com'
            },
            alert = {
                alertId: 1
            },
            comment = Math.random().toString(),
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert),
                addComments: sinon.stub().callsArgWith(2)
            };

        scope.$root = { currentUser: user };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.addComment(comment);

        // attest
        expect(scope.comments.length).to.equal(1);
        expect(scope.comments[0].text).to.equal(comment);
        expect(scope.currentComment).to.equal(null);
        expect(scope.addingComment).to.equal(false);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
        expect(serviceMock.addComments.calledOnce).to.equal(true);
    });

    it('should not add a comment when requested by user if it is empty', function(){
        // prepare
        var user = {
                email: 'user1@mail.com'
            },
            alert = {
                alertId: 1
            },
            comment = undefined,
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert),
                addComments: sinon.stub().callsArgWith(1)
            };

        scope.$root = { currentUser: user };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.addComment(comment);

        // attest
        expect(scope.comments.length).to.equal(0);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
        expect(serviceMock.addComments.calledOnce).to.equal(false);
    });

    it('should parse timestamp', function(){
        // prepare
        var serviceMock = {
            getAlert: sinon.spy()
        };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        var actual = scope.parseTimestamp(Date.now());

        // attest
        expect(actual).not.to.be.a('undefined');
    });

    it('should change status when requested by user - status = New', function(){
        // prepare
        var alert = {
                alertId: 1,
                status: 'New'
            },
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert),
                updateStatus: sinon.stub().callsArgWith(1),
                reset: sinon.spy()
            };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.changeStatus();

        // attest
        expect(scope.error).to.equal(null);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(serviceMock.reset.calledOnce).to.equal(false);
    });

    it('should change status when requested by user - status = New - request failed', function(){
        // prepare
        var alert = {
                alertId: 1,
                status: 'New'
            },
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert),
                updateStatus: sinon.stub().callsArgWith(2),
                reset: sinon.spy()
            };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.changeStatus();

        // attest
        expect(scope.error).to.equal(scope.$parent.i18n.alerts.errors.updateAlerts);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
        expect(serviceMock.updateStatus.calledOnce).to.equal(true);
        expect(serviceMock.reset.calledOnce).to.equal(false);
    });

    it('should change status when requested by user - status = Closed', function(){
        // prepare
        var alert = {
                alertId: 1,
                status: 'Closed'
            },
            serviceMock = {
                getAlert: sinon.stub().callsArgWith(1, alert),
                updateStatus: sinon.spy(),
                reset: sinon.stub().callsArgWith(1)
            };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: {},
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.changeStatus();

        // attest
        expect(scope.error).to.equal(null);
        expect(serviceMock.getAlert.calledOnce).to.equal(true);
        expect(serviceMock.updateStatus.calledOnce).to.equal(false);
        expect(serviceMock.reset.calledOnce).to.equal(true);
    });

    it('should go to /alerts when user clicks Close button', function(){
        // prepare
        var serviceMock = {
            getAlert: sinon.spy()
        };

        ctrl = controllerProvider('EditAlertCtrl', {
            $scope: scope,
            $routeParams: {},
            $location: location,
            alertsService: serviceMock,
            rulesService: rulesServiceMock
        });

        // execute
        scope.close();

        // attest
        expect(location.path()).to.equal('/alerts');
    });
});