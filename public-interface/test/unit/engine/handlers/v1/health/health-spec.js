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
    config = require('../../../../../../config'),
    rewire = require('rewire'),
    healthHandler = rewire('../../../../../../engine/handlers/v1/health/health'),
    errBuilder  = require("../../../../../../lib/errorHandler/index").errBuilder,
    httpStatuses = require('../../../../../../engine/res/httpStatuses');

describe('health handler', function() {
    var resMock, reqMock, nextMock, healthApiMock;
    beforeEach(function(){
        reqMock = {
            query: {}
        };
        resMock = {
            writeHead: sinon.spy(),
            write: sinon.spy(),
            end: sinon.spy()
        };
        nextMock = sinon.spy();
        healthApiMock = {
            getApiVersion: sinon.stub().callsArgWith(0, null, null),
            getEnvironmentHealth: sinon.stub().callsArgWith(0, null, null)
        };
    });
    it('should send health data if request is valid', function(done) {
        // prepare
        var version = 'test';
        healthApiMock = {
            getApiVersion: sinon.stub().callsArgWith(0, null, version)
        };

        // execute
        healthHandler.health(reqMock, resMock);

        // attest
        expect(resMock.writeHead.calledOnce).to.equal(true);
        expect(resMock.write.calledOnce).to.equal(true);
        expect(resMock.end.calledOnce).to.equal(true);
        expect(resMock.writeHead.calledWith(httpStatuses.OK.code)).to.equal(true);

        done();
    });

    it('should send health data if request is valid without version', function(done) {
        // prepare
        reqMock.query.secret = 'secret code';
        // execute
        healthHandler.health(reqMock, resMock);

        // attest
        expect(resMock.writeHead.calledOnce).to.equal(true);
        expect(resMock.write.calledOnce).to.equal(true);
        expect(resMock.end.calledOnce).to.equal(true);
        expect(resMock.writeHead.calledWith(httpStatuses.OK.code)).to.equal(true);

        done();
    });


});