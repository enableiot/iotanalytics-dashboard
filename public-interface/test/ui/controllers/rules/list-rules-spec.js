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

describe('list rules', function(){
    var scope,
        rootScope,
        location,
        controllerProvider,
        sessionServiceAPI,
        ctrl,
        ngTableParams = function(){
            this.reload = sinon.spy();
        },
        ngProgressStub,
        util;

    var ModalMock = function() {
        var self = this;
        this.open = function(config){
            return {
                result: {
                    config: config,
                    then: function(confirm, cancel)
                    {
                        self.confirm = confirm;
                        self.cancel = cancel;
                    }
                },
                close: function(res){
                    if(self.confirm) {
                        self.confirm(res);
                    }
                },
                dismiss: function(){
                    if(self.cancel) {
                        self.cancel();
                    }
                }
            };
        };
    };

    beforeEach(module('iotController'));
    beforeEach(module('ngProgress'));


    beforeEach(inject(function($controller, $rootScope, $location, ngProgress) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        controllerProvider = $controller;
        location = $location;
        rootScope.i18n = { rules: { errors: { update: 'test' } } };
        ngProgressStub = sinon.stub(ngProgress);
        util = {convertToNgOption: function(){},
                getObjectKey: function (){}};
    }));

    it('should change selected menu to "rules"', function(){
        scope.$watch = function(a,b){b(typeof a === "string" ? scope[a] :  a())};

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: {},
            $filter:{},
            $modal: {},
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: {},
            orderingService: {},
            filteringService: {},
            sessionService: sessionServiceAPI,
            ngProgress: ngProgressStub,
            utilityService: util
        });

        expect(rootScope.page.menuSelected).to.equal('rules');
    });

    it('should create "rules" model with no rules', function(){

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: {},
            $filter:{},
            $modal: {},
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: {},
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        expect(scope.rules.length).to.equal(0);
    });

    it('should change path when clicking add rules button', function(){

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: {},
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: {},
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        location.path('/undefined');
        expect(location.path()).to.contain('/undefined');

        scope.addRule();
        expect(location.path()).to.contain('/rules/add');
    });

    it('should change status of given rule if user confirms the change', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Archived',
            rulesServiceMock = {
                updateRuleStatus: sinon.stub().callsArgWith(2)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        scope.tableRules = {data:[], reload:{calledOnce:true}};
        var modalInstance = scope.changeRuleStatus(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.confirm();

        // assert
        expect(rulesServiceMock.updateRuleStatus.calledOnce).to.equal(true);
        expect(rulesServiceMock.updateRuleStatus.args[0].length).to.equal(4);
        expect(rulesServiceMock.updateRuleStatus.args[0][0]).to.equal(rule.externalId);
        expect(rulesServiceMock.updateRuleStatus.args[0][1].status).to.equal(newStatus);
        expect(scope.error).to.be.null;
    });

    it('should not change status of given rule if user confirms the change but an error happens at backend', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Archived',
            rulesServiceMock = {
                updateRuleStatus: sinon.stub().callsArgWith(3)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        var modalInstance = scope.changeRuleStatus(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.confirm();

        // assert
        expect(rulesServiceMock.updateRuleStatus.calledOnce).to.equal(true);
        expect(rulesServiceMock.updateRuleStatus.args[0].length).to.equal(4);
        expect(rulesServiceMock.updateRuleStatus.args[0][0]).to.equal(rule.externalId);
        expect(rulesServiceMock.updateRuleStatus.args[0][1].status).to.equal(newStatus);
        expect(scope.tableRules.reload.calledOnce).to.equal(false);
        expect(scope.error).to.equal('test');
    });

    it('should not change status of given rule if user does not confirm the change', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Archived',
            rulesServiceMock = {
                updateRuleStatus: sinon.stub().callsArgWith(2)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        var modalInstance = scope.changeRuleStatus(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.cancel();

        // assert
        expect(rulesServiceMock.updateRuleStatus.calledOnce).to.equal(false);
        expect(scope.tableRules.reload.calledOnce).to.equal(false);
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

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: {},
            $q: qMock,
            ngTableParams: ngTableParams,
            rulesService: {},
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI

        });

        // execute
        scope.getStatusesToFilterWith();

        // assert
        expect(qMock.defer.calledOnce).to.equal(true);
        expect(defMock.resolve.calledOnce).to.equal(true);
        expect(defMock.resolve.args[0].length).to.equal(1);
        var actual = defMock.resolve.args[0][0];
        expect(actual.length).to.equal(5);
        expect(actual[0].id).to.equal('Draft');
        expect(actual[0].title).to.equal('Draft');
        expect(actual[1].id).to.equal('Deleted');
        expect(actual[1].title).to.equal('Deleted');
        expect(actual[2].id).to.equal('Active');
        expect(actual[2].title).to.equal('Active');
        expect(actual[3].id).to.equal('On-hold');
        expect(actual[3].title).to.equal('On-hold');
        expect(actual[4].id).to.equal('Archived');
        expect(actual[4].title).to.equal('Archived');
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

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: {},
            $q: qMock,
            ngTableParams: ngTableParams,
            rulesService: {},
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
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

    it('should delete draft rule if user confirms the change', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Draft',
            rulesServiceMock = {
                deleteDraft: sinon.stub().callsArgWith(1)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        var modalInstance = scope.deleteDraft(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.confirm();

        // assert
        expect(rulesServiceMock.deleteDraft.calledOnce).to.equal(true);
        expect(rulesServiceMock.deleteDraft.args[0].length).to.equal(3);
        expect(rulesServiceMock.deleteDraft.args[0][0]).to.equal(rule.externalId);
        expect(scope.tableRules.reload.calledOnce).to.equal(true);
        expect(scope.error).to.be.null;
    });

    it('should not delete draft rule if user cancels the change', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Draft',
            rulesServiceMock = {
                deleteDraft: sinon.stub().callsArgWith(2)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        var modalInstance = scope.deleteDraft(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.cancel();

        // assert
        expect(rulesServiceMock.deleteDraft.calledOnce).to.equal(false);
        expect(scope.tableRules.reload.calledOnce).to.equal(false);
    });

    it('should delete rule if user confirms the change', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Delete',
            rulesServiceMock = {
                deleteRule: sinon.stub().callsArgWith(1)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        var modalInstance = scope.deleteRule(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.confirm();

        // assert
        expect(rulesServiceMock.deleteRule.calledOnce).to.equal(true);
        expect(rulesServiceMock.deleteRule.args[0].length).to.equal(3);
        expect(rulesServiceMock.deleteRule.args[0][0]).to.equal(rule.externalId);
        expect(scope.tableRules.reload.calledOnce).to.equal(true);
        expect(scope.error).to.be.null;
    });

    it('should not delete rule if user cancels the change', function(){
        // prepare
        var rule = {
                externalId: 1
            },
            newStatus = 'Delete',
            rulesServiceMock = {
                deleteRule: sinon.stub().callsArgWith(2)
            };

        ctrl = controllerProvider('ListRulesCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $location: location,
            $filter:{},
            $modal: new ModalMock(),
            $q: {},
            ngTableParams: ngTableParams,
            rulesService: rulesServiceMock,
            orderingService: {},
            filteringService: {},
            ngProgress: ngProgressStub,
            utilityService: util,
            sessionService: sessionServiceAPI
        });

        // execute
        var modalInstance = scope.deleteRule(rule, newStatus);
        var modalCtrl = new modalInstance.result.config.controller(scope, modalInstance, rule, newStatus);
        scope.cancel();

        // assert
        expect(rulesServiceMock.deleteRule.calledOnce).to.equal(false);
        expect(scope.tableRules.reload.calledOnce).to.equal(false);
    });
});