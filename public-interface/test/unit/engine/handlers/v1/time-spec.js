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

var expect = require('expect.js'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    httpStatuses = require('../../../../../engine/res/httpStatuses'),
    timeHandler = rewire('../../../../../engine/handlers/v1/time');

describe('time handler', function() {
    var resMock, responseCode,resSendMock;

    beforeEach( function(){
        responseCode = null;
        resSendMock = sinon.spy();
        resMock = {
            send: sinon.spy(),
            status: function(code) {
                responseCode = code;
                return {
                    send: resSendMock
                };
            }
        };
    });

    afterEach( function(){
        timeHandler.__set__('time', undefined);
    });

    describe('usage', function(){
        it('should respond 200 with specific headers', function(done){
            // prepare
            resMock.setHeader = sinon.spy();

            // execute
            timeHandler.usage({}, resMock);

            // attest
            expect(responseCode).to.equal(httpStatuses.OK.code);
            expect(resMock.setHeader.calledWith('Time-Methods', 'GET')).to.equal(true);

            done();
        });
    });

    describe('getActualTime', function(){
        it('should respond with actual time', function(done){
            // prepare
            var time = '2015-01-01 15:15:15',
                timeJSON = {
                    actualTime: time
                },
                apiMock = {
                    getActualTime: sinon.stub().callsArgWith(0, null, time)
                };

            timeHandler.__set__('time', apiMock);

            // execute
            timeHandler.getActualTime({}, resMock);

            // attest
            expect(resSendMock.calledWith(timeJSON)).to.equal(true);
            expect(responseCode).to.equal(httpStatuses.OK.code);

            done();
        });

        it('should respond with an error if something went wrong', function(done){
            // prepare
            var error = new Error(500),
                apiMock = {
                    getActualTime: sinon.stub().callsArgWith(0, error)
                },
                nextSpy = sinon.spy();

            timeHandler.__set__('time', apiMock);

            // execute
            timeHandler.getActualTime({}, {}, nextSpy);

            // attest
            expect(nextSpy.calledWith(error)).to.equal(true);

            done();
        });
    });
});