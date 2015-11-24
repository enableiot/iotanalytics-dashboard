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
var expect = require('expect.js'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    compHandler = rewire('../../../../../engine/handlers/v1/components'),
    httpStatuses = require('../../../../../engine/res/httpStatuses');

describe('components handler', function(){
    var responseCode;
    var reqMock = {
            params: {
                accountId: 1
            },
            forwardedHeaders: {
                baseUrl: 'https://dashboard.enableiot.com'
            },
            query: {}
        },
        resMock = {
            send: sinon.spy(),
            status: function(code) {
                responseCode = code;
                return this;
            }
        };

    var initResponseMock = function() {
        responseCode = null;
        resMock = {
            send: sinon.spy(),
            status: function(code) {
                responseCode = code;
                return this;
            }
        }
    };

    var expectResponseCode = function (code, body) {
        expect(resMock.send.calledOnce).to.equal(true);
        expect(responseCode).to.eql(code);
        if (body) {
            expect(resMock.send.calledWith(body)).to.equal(true);
        }
    };

    var expectOkResponse = function(body) {
        expectResponseCode(httpStatuses.OK.code);
        if (body) {
            expect(resMock.send.calledWith(body)).to.equal(true);
        }
    };

    var expectCreatedResponse = function(body) {
        expectResponseCode(httpStatuses.Created.code);
        if (body) {
            expect(resMock.send.calledWith(body)).to.equal(true);
        }
    };

    describe('usage', function(){
        beforeEach(function() {
            initResponseMock();
        });
        it('should respond 200', function(done){
            // prepare
            resMock.setHeader = sinon.spy();

            // execute
            compHandler.usage(reqMock, resMock);

            // attest
            expectOkResponse();
            expect(resMock.setHeader.calledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')).to.equal(true);

            done();
        });
    });

    describe('get components', function(){
        beforeEach(function() {
            initResponseMock();
        });
        it('should get all components', function(done){
            // prepare
            var components = [
                    {
                        id: 'temperature.v1'
                    },
                    {
                        id: 'humidity.v1'
                    }
                ],
                apiMock = {
                    getComponents: sinon.stub().callsArgWith(3, null, components)
                };

            reqMock.url = '/v1/ap/cmpcatalog';
            compHandler.__set__('components', apiMock);

            // execute
            compHandler.getComponents(reqMock, resMock);

            // attest
            expectOkResponse(components);

            done();
        });

        it('should return an error when something weird happens', function(done){
            // prepare
            var error = new Error(500),
                apiMock = {
                    getComponents: sinon.stub().callsArgWith(3, error)
                },
                nextSpy = sinon.spy();

            reqMock.url = '/v1/ap/cmpcatalog';
            compHandler.__set__('components', apiMock);

            // execute
            compHandler.getComponents(reqMock, {}, nextSpy);

            // attest
            expect(nextSpy.calledWith(error)).to.equal(true);

            done();
        });
    });

    describe('get component', function(){
        beforeEach(function() {
            initResponseMock();
        });
        it('should return a component', function(done){
            // prepare
            var component = {
                    id: 'temperature.v1'
                },
                apiMock = {
                    getComponent: sinon.stub().callsArgWith(1, null, component)
                };

            reqMock.params = {accountId: 1, componentId: component.id};
            compHandler.__set__('components', apiMock);

            // execute
            compHandler.getComponent(reqMock, resMock);

            // attest
            expectOkResponse(component);

            done();
        });

        it('should return an error when a component does not exist', function(done){
            // prepare
            var error = new Error(404),
                apiMock = {
                    getComponent: sinon.stub().callsArgWith(1, error)
                },
                nextSpy = sinon.spy();

            reqMock.params = {accountId:1, componentId: '1'};
            compHandler.__set__('components', apiMock);

            // execute
            compHandler.getComponent(reqMock, {}, nextSpy);

            // attest
            expect(nextSpy.calledWith(error)).to.equal(true);

            done();
        });
    });

    describe('add component', function(){
        beforeEach(function() {
            initResponseMock();
        });
        it('should add a component if does not exist', function(done){
            // prepare
            var component = {
                    dimension: 'temperature',
                    version: '1.0'
                },
                apiMock = {
                    addComponent: sinon.stub().callsArgWith(1, null, component)
                };

            compHandler.__set__('components', apiMock);

            // execute
            compHandler.addComponent(reqMock, resMock);

            // attest
            expectCreatedResponse(component);

            done();
        });

        it('should call callback with an error is something weird happens', function(done){
            // prepare
            var error = new Error(500),
                apiMock = {
                    addComponent: sinon.stub().callsArgWith(1, error)
                },
                nextSpy = sinon.spy();

            compHandler.__set__('components', apiMock);

            // execute
            compHandler.addComponent(reqMock, {}, nextSpy);

            // attest
            expect(nextSpy.calledWith(error)).to.equal(true);

            done();
        });
    });

    describe('update component', function(){
        beforeEach(function() {
            initResponseMock();
        });
        it('should update a component if it exists', function(done){
            // prepare
            var component = {
                    id: 'temperature.v1'
                },
                apiMock = {
                    updateComponent: sinon.stub().callsArgWith(1, null, component)
                };

            compHandler.__set__('components', apiMock);
            reqMock.params = { componentId: component.id};
            reqMock.url = '/v1/api/cmpcatalog/' + reqMock.params.componentId;

            // execute
            compHandler.updateComponent(reqMock, resMock);

            // attest
            expectCreatedResponse(component);

            done();
        });

        it('should call callback with an error is something weird happens', function(done){
            // prepare
            var error = new Error(500),
                apiMock = {
                    updateComponent: sinon.stub().callsArgWith(1, error)
                },
                nextSpy = sinon.spy();

            compHandler.__set__('components', apiMock);
            reqMock.params = { componentId: 'temperature.v1'};
            reqMock.url = '/v1/api/cmpcatalog/' + reqMock.params.componentId;

            // execute
            compHandler.updateComponent(reqMock, {}, nextSpy);

            // attest
            expect(nextSpy.calledWith(error)).to.equal(true);

            done();
        });
    });
});