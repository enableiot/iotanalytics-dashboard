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
describe('components service', function(){
    var componentsService,
        httpBackend,
        accountId = 1;

    beforeEach(function(){
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


        inject(function($httpBackend, _componentsService_) {
            componentsService = _componentsService_;
            httpBackend = $httpBackend;
        });
    });

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('get component definition', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = {
                    type: 'temperature.v1.0'
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectGET('/accounts/'+accountId+'/cmpcatalog/' + returnData.type).respond(returnData);

            // execute
            componentsService.getComponentDefinition(returnData.type, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].type).to.equal(returnData.type);
        });

        it('should call error callback if something goes wrong', function(){
            // prepare
            var error = {
                    code: 500,
                    message: 'internal server error'
                },
                cmp = {
                    type: 'temperature.v1.0'
                },
                successCallback = sinon.spy(),
                errorCallback = sinon.spy();

            httpBackend.expectGET('/accounts/'+accountId+'/cmpcatalog/' + cmp.type).respond(error.code, error.message);

            // execute
            componentsService.getComponentDefinition(cmp.type, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(false);
            expect(errorCallback.calledOnce).to.equal(true);
            expect(errorCallback.args[0].length).to.equal(4);
            expect(errorCallback.args[0][1]).to.equal(error.code);
        });
    });
});