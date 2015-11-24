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
describe('rule service', function() {
    var rulesService,
        httpBackend,
        accountId = 1;

    beforeEach(function() {
        module('iotServices');

        var sessionServiceMock = {
            url: '',
            then : function(callback){
                callback(this.url)
            },
            addAccountIdPrefix : function(url){
                this.url = '/accounts/' + accountId + url;
                return this;
            }
        };

        module(function($provide){
            $provide.value('ipCookie', {});
            $provide.value('sessionService', sessionServiceMock);
        });

        inject(function($httpBackend, _rulesService_) {
            rulesService = _rulesService_;
            httpBackend = $httpBackend;
        });
    });

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('get rules', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = [
                    {
                        externalId: 1
                    }
                ],
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

        httpBackend.expectGET(new RegExp('/accounts/' + accountId+'/rules?.*$')).respond(returnData);

            // execute
            rulesService.getRules(successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(2);
            expect(successCallback.args[0][0][0].externalId).to.equal(returnData[0].externalId);
        });

        it('should call callback with if something weird happens', function(){
            // prepare
            var error = {
                    code: 500,
                    message: 'internal server error'
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectGET(new RegExp('/accounts/' + accountId+'/rules?.*$')).respond(error.code, error.message);

            // execute
            rulesService.getRules(successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(false);
            expect(errorCallback.calledOnce).to.equal(true);
            expect(errorCallback.args[0].length).to.equal(4);
            expect(errorCallback.args[0][1]).to.equal(error.code);
        });
    });

    describe('update rule status', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = {
                    externalId: 1
                },
                rule = {
                    externalId: 1
                },
                ruleStatus = {
                    status: 'Archived'
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectPUT('/accounts/' + accountId+'/rules/' + rule.externalId + '/status').respond(returnData);

            // execute
            rulesService.updateRuleStatus(rule.externalId, ruleStatus, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(2);
            expect(successCallback.args[0][0].externalId).to.equal(returnData.externalId);
        });

        it('should call callback with if something weird happens', function(){
            // prepare
            var error = {
                    code: 500,
                    message: 'internal server error'
                },
                rule = {
                    externalId: 1
                },
                ruleStatus = {
                    status: 'Archived'
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectPUT('/accounts/' + accountId+'/rules/' + rule.externalId + '/status').respond(error.code, error.message);

            // execute
            rulesService.updateRuleStatus(rule.externalId, ruleStatus, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(false);
            expect(errorCallback.calledOnce).to.equal(true);
            expect(errorCallback.args[0].length).to.equal(4);
            expect(errorCallback.args[0][1]).to.equal(error.code);
        });
    });

    describe('delete draft', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var rule = {
                    externalId: 1
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectDELETE('/accounts/' + accountId+'/rules/draft/' + rule.externalId).respond(204);

            // execute
            rulesService.deleteDraft(rule.externalId, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][1]).to.equal(204);
        });

        it('should call callback with if something weird happens', function(){
            // prepare
            var error = {
                    code: 500,
                    message: 'internal server error'
                },
                rule = {
                    externalId: 1
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectDELETE('/accounts/' + accountId+'/rules/draft/' + rule.externalId).respond(error.code, error.message);

            // execute
            rulesService.deleteDraft(rule.externalId, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(false);
            expect(errorCallback.calledOnce).to.equal(true);
            expect(errorCallback.args[0].length).to.equal(4);
            expect(errorCallback.args[0][1]).to.equal(error.code);
        });
    });
});