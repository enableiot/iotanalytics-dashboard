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
describe('device service', function(){
    var devicesService,
        httpBackend,
        successCallback,
        errorCallback,
        internalError = {
            code: 500,
            message: 'internal server error'
        },
        accountId=1;


    beforeEach(function(){
        module('iotServices');
        successCallback = sinon.spy();
        errorCallback = sinon.spy();

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

        inject(function($httpBackend, _devicesService_) {
            devicesService = _devicesService_;
            httpBackend =  $httpBackend;

        });
    });

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    function expectInternalServerError(){
        expect(successCallback.calledOnce).to.equal(false);
        expect(errorCallback.calledOnce).to.equal(true);
        expect(errorCallback.args[0].length).to.equal(4);
        expect(errorCallback.args[0][1]).to.equal(internalError.code);
    }

    describe('get totals', function(){
        it('should get totals', function(){
            // prepare
            var returnData = {
                device: {
                    total: Math.random()
                }
            };
            httpBackend.expectGET(new RegExp('^/accounts/'+accountId+'/devices/totals?.*$')).respond(returnData);

            // execute
            devicesService.getTotal();
            httpBackend.flush();

            // attest
            expect(devicesService.data.device.total).to.equal(returnData.device.total);
        });

        it('should not modify data with service responds with an error', function(){
            // prepare
            httpBackend.expectGET(new RegExp('^/accounts/'+accountId+'/devices/totals?.*$')).respond(404);

            // execute
            devicesService.getTotal();
            httpBackend.flush();

            // attest
            expect(devicesService.data.device).to.equal(0);
        });
    });

    describe('get devices', function(){
        it('should call success callback with returned devices', function(){
            // prepare
            var returnData = [
                    {
                        deviceId: 1
                    },
                    {
                        deviceId: 2
                    }
                ],
            queryParameters = {skip: 0, limit: 10};
            httpBackend.expectGET('/accounts/'+accountId+'/devices?skip=0&limit=10').respond(returnData);

            // execute
            devicesService.getDevices(queryParameters, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].length).to.equal(returnData.length);
        });

        it('should call error callback with if an error happens in backend', function(){
            // prepare
            var queryParameters = {skip: 0, limit: 10};
            httpBackend.expectGET('/accounts/'+accountId+'/devices?skip=0&limit=10').respond(internalError.code, internalError.message);

            // execute
            devicesService.getDevices(queryParameters, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('delete device', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var deviceId = '1',
                status = 204;

            httpBackend.expectDELETE('/accounts/'+accountId+'/devices/' + deviceId).respond(status);

            // execute
            devicesService.deleteDevice(deviceId, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][1]).to.equal(status);
        });

        it('should call error callback if something weird happens', function(){
            // prepare
            var deviceId = '1';

            httpBackend.expectDELETE('/accounts/'+accountId+'/devices/' + deviceId).respond(internalError.code, internalError.message);

            // execute
            devicesService.deleteDevice(deviceId, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('add device', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = {
                    deviceId: 1
                },
                device = {
                    deviceId: 1,
                    tags: [],
                    loc: {
                        latitude: 1,
                        longitude: 1,
                        height: 1
                    }
                },
                deviceAfterProcessing = {
                    deviceId: 1,
                    loc: [1, 1, 1]
                };

            httpBackend.expectPOST('/accounts/'+accountId+'/devices/', deviceAfterProcessing).respond(returnData);

            // execute
            devicesService.addDevice(device, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].deviceId).to.equal(returnData.deviceId);
        });

        it('should call success callback if everything is ok - location is not defined', function(){
            // prepare
            var returnData = {
                    deviceId: 1
                },
                device = {
                    deviceId: 1,
                    tags: [],
                    loc: {
                    }
                },
                deviceAfterProcessing = {
                    deviceId: 1
                };
            httpBackend.expectPOST('/accounts/'+accountId+'/devices/', deviceAfterProcessing).respond(returnData);

            // execute
            devicesService.addDevice(device, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].deviceId).to.equal(returnData.deviceId);
        });

        it('should call error callback if something goes wrong', function(){
            // prepare
            httpBackend.expectPOST('/accounts/'+accountId+'/devices/').respond(internalError.code, internalError.message);
            var device = {};
            // execute
            devicesService.addDevice(device, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('update device', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = {
                    deviceId: 1
                },
                device = {
                    deviceId: 1,
                    gatewayId: 'test',
                    name: 'hola',
                    tags: ['arg'],
                    loc: {
                        latitude: 1,
                        longitude: 1,
                        height: 1
                    },
                    status: 'created',
                    created: new Date().getTime(),
                    components: [],
                    activationCode: 'qwerty'
                },
                deviceAfterProcessing = {
                    gatewayId: 'test',
                    name: 'hola',
                    tags: ['arg'],
                    loc: [1, 1, 1]
                };

            httpBackend.expectPUT('/accounts/'+accountId+'/devices/' + device.deviceId, deviceAfterProcessing).respond(returnData);

            // execute
            devicesService.updateDevice(device, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].deviceId).to.equal(returnData.deviceId);
        });

        it('should call error callback if something weird happens', function(){
            // prepare
            var device = {
                deviceId:1
            };
            httpBackend.expectPUT('/accounts/'+accountId+'/devices/' + device.deviceId).respond(internalError.code, internalError.message);

            // execute
            devicesService.updateDevice(device, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('get device', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = {
                    deviceId: 1,
                    gatewayId: 'test',
                    name: 'hola',
                    loc: [1, 2, 3],
                    status: 'created',
                    created: new Date().getTime(),
                    components: [],
                    activationCode: 'qwerty'
                },
                loc = {
                    latitude: 1,
                    longitude: 2,
                    height: 3
                };

            httpBackend.expectGET('/accounts/'+accountId+'/devices/' + returnData.deviceId).respond(returnData);

            // execute
            devicesService.getDevice(returnData.deviceId, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(2);
            expect(successCallback.args[0][0].loc.latitude).to.equal(loc.latitude);
            expect(successCallback.args[0][0].loc.longitude).to.equal(loc.longitude);
            expect(successCallback.args[0][0].loc.height).to.equal(loc.height);
        });

        it('should call error callback if something weird happens', function(){
            // prepare
           var deviceId = 1;

            httpBackend.expectGET('/accounts/'+accountId+'/devices/' + deviceId).respond(internalError.code, internalError.message);

            // execute
            devicesService.getDevice(deviceId, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('count devices', function(){
       it('should call success callback if everything is ok',function(){
           var returnData = {
                   device:{ total: 1}
           },
               query={};

           httpBackend.expectPOST('/accounts/'+accountId+'/devices/count').respond(returnData);

           // execute
           devicesService.countDevices(query, successCallback, errorCallback);
           httpBackend.flush();

           // attest
           expect(successCallback.calledOnce).to.equal(true);
           expect(errorCallback.calledOnce).to.equal(false);
           expect(successCallback.args[0].length).to.equal(4);
           expect(successCallback.args[0][0].device.total).to.equal(returnData.device.total);
       });

        it('should call error callback if something weird happens', function(){
            var canceler = sinon.spy(),
                query = [];
            httpBackend.expectPOST('/accounts/'+accountId+'/devices/count').respond(internalError.code, internalError.message);

            // execute
            devicesService.countDevices(query,successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('search devices', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = [
                    {
                        deviceId: 1
                    }
                ],
                filters = [],
                query = [];

            httpBackend.expectPOST('/accounts/'+accountId+'/devices/search?', filters).respond(returnData);


            // execute
            devicesService.searchDevices(filters, query, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].length).to.equal(returnData.length);
        });

        it('should call error callback if something weird happens', function(){
            // prepare
            var    filters = [],
                query = [];

            httpBackend.expectPOST('/accounts/'+accountId+'/devices/search?', filters).respond(internalError.code, internalError.message);

            var canceler = sinon.spy();
            // execute
            devicesService.searchDevices(filters, query, successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('get tags', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = ['arg', 'cordoba'];

            httpBackend.expectGET('/accounts/'+accountId+'/devices/tags').respond(returnData);

            // execute
            devicesService.getTags(successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0].length).to.equal(returnData.length);
        });

        it('should call error callback if something weird happens', function(){
            // prepare
            httpBackend.expectGET('/accounts/'+accountId+'/devices/tags').respond(internalError.code, internalError.message);

            // execute
            devicesService.getTags(successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });

    describe('get attributes', function(){
        it('should call success callback if everything is ok', function(){
            // prepare
            var returnData = {
                "Firmware Version":[
                    "V1"
                ]
            };

            httpBackend.expectGET('/accounts/'+accountId+'/devices/attributes').respond(returnData);

            // execute
            devicesService.getAttributes(successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expect(successCallback.calledOnce).to.equal(true);
            expect(errorCallback.calledOnce).to.equal(false);
            expect(successCallback.args[0].length).to.equal(4);
            expect(successCallback.args[0][0]).to.eql(returnData);
        });

        it('should call error callback if something weird happens', function(){
            // prepare
            httpBackend.expectGET('/accounts/'+accountId+'/devices/attributes').respond(internalError.code, internalError.message);

            // execute
            devicesService.getAttributes(successCallback, errorCallback);
            httpBackend.flush();

            // attest
            expectInternalServerError();
        });
    });


});