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
    errorHandlerManager = rewire('../../../../lib/errorHandler/errorHandler'),
    errorList = require('../../../../engine/res/errors');

describe("Error Handler tests", function() {
    var err, req, res, next, responseCode;

    beforeEach(function(){
        responseCode = null;
        err = {};
        req = {};
        res = {
            send: sinon.spy(),
            status: function(code) {
                responseCode = code;
                return this;
            }
        };
        next = sinon.spy();
    });

    var expectResponseCode = function (code, body) {
        expect(res.send.calledOnce).to.equal(true);
        expect(responseCode).to.eql(code);
        if (body) {
            expect(res.send.calledWith(body)).to.equal(true);
        }
    };

    describe("middleware", function () {

        it('Should send Internal Server Error if error is not specified', function (done) {
            //execute
            var middleware = errorHandlerManager.middleware();
            middleware(err, req, res, next);
            //attest
            expectResponseCode(errorList.Errors.Generic.InternalServerError.status, errorList.Errors.Generic.InternalServerError);

            done();
        });

        it('Should send specified error if business', function (done) {
            //prepare
            err = {
                status: errorList.Errors.Generic.InvalidRequest.status,
                business: true,
                asResponse: sinon.spy()
            };
            //execute
            var middleware = errorHandlerManager.middleware();
            middleware(err, req, res, next);
            //attest
            expectResponseCode(400);
            expect(err.asResponse.calledOnce).to.equal(true);

            done();
        });

        it('Should send error for syntax error', function (done) {
            //prepare
            err = {
                status: errorList.Errors.Generic.InvalidRequest.status,
                name: 'SyntaxError'
            };
            //execute
            var middleware = errorHandlerManager.middleware();
            middleware(err, req, res, next);
            //attest
            expectResponseCode(err.status, errorList.Errors.Generic.InvalidRequest);

            done();
        });

        it('Should send internal server error if only errror status is given', function (done) {
            //prepare
            err.status = errorList.Errors.Generic.InvalidRequest.status;
            //execute
            var middleware = errorHandlerManager.middleware();
            middleware(err, req, res, next);
            //attest
            expectResponseCode(errorList.Errors.Generic.InternalServerError.status, errorList.Errors.Generic.InternalServerError);

            done();
        });
    });
    describe("errBuilder", function () {
        it('Should build Error with definition if error definition is available', function (done) {
            //prepare
            var errDefinitionMock = {
                    9999999999999: {message: "my Error"}
                },
                myErrorCode = 9999999999999;
            errorHandlerManager.__set__('errDefinition', errDefinitionMock);

            //execute
            var err = errorHandlerManager.errBuilder.build(9999999999999);

            //attest
            expect(err.code).to.equal(myErrorCode);
            expect(err.message).to.equal(errDefinitionMock['9999999999999']['message']);

            done();
        });
    });
});