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
    engineErrors = require('../../../../../engine/res/errors').Errors,
    errBuilder  = require("../../../../../lib/errorHandler").errBuilder,
    testHandler = rewire('../../../../../engine/handlers/v1/test'),
    Q = require('q');

describe('test handler', function() {
    var usersApiMock,
        userInteractionTokenDbMock,
        userValidatorMock,
        req,
        res,
        next,
        user,
        token,
        responseCode,
        config = {
            interactionTokenGenerator: {
                permissionKey: 'examplePermissionKey'
            },
            biz: {
                domain: {
                    defaultActivateTokenExpiration: 1000
                }
            }
        };

    beforeEach(function(){
        Q.longStackSupport = true;
        usersApiMock = {
            searchUser: sinon.stub()
        };
        userValidatorMock = {
            isPasswordCorrect: sinon.stub()
        };
        userInteractionTokenDbMock = {
            new: sinon.stub()
        };
        res = {
            send: sinon.spy(),
            status: function(code) {
                responseCode = code;
                return this;
            }
        };
        next = sinon.spy();

        req = {
            body: {
                username: 'test-12345@test.com',
                password: 'secret',
                type: 'activate-user',
                secretKey: config.interactionTokenGenerator.permissionKey

            }
        };
        user = {
            email: req.body.username
        };
        token = {id:'AbCdEf42'};
        responseCode = null;

        testHandler.__set__('users', usersApiMock);
        testHandler.__set__('userInteractionToken', userInteractionTokenDbMock);
        testHandler.__set__('userValidator', userValidatorMock);
        testHandler.__set__('config', config);
    });

    describe('get interaction token', function() {

        var validateSearchUserArgs = function () {
            expect(usersApiMock.searchUser.calledOnce).to.equal(true);
            expect(usersApiMock.searchUser.args[0][0]).to.equal(req.body.username);
        };

        var validateIsPasswordCorrectArgs = function () {
            expect(userValidatorMock.isPasswordCorrect.calledOnce).to.equal(true);
            expect(userValidatorMock.isPasswordCorrect.args[0].length).to.equal(2);
            expect(userValidatorMock.isPasswordCorrect.args[0][0]).to.equal(req.body.password);
            expect(JSON.stringify(userValidatorMock.isPasswordCorrect.args[0][1])).to.equal(JSON.stringify(user));
        };

        var validateUserInteractionTokenArgs = function () {
            var time = new Date().getTime();
            expect(userInteractionTokenDbMock.new.calledOnce).to.equal(true);
            expect(userInteractionTokenDbMock.new.args[0][0].email).to.equal(user.email);
            expect(userInteractionTokenDbMock.new.args[0][0].type).to.equal(req.body.type);
            expect(userInteractionTokenDbMock.new.args[0][0].expiresAt).to.greaterThan(time);
        };

        var expectError = function (expectedError) {
            expect(next.calledOnce).to.equal(true);
            expect(next.args[0][0].status).to.equal(expectedError.status);
            expect(next.args[0][0].code).to.equal(expectedError.code);
            expect(next.args[0][0].message).to.equal(expectedError.message);
            expect(res.send.called).to.equal(false);
        };

        var expectArgIsError = function (arg, expectedError) {
            expect(arg).to.eql(errBuilder.build(expectedError));
            expect(res.send.called).to.equal(false);
        };

        describe('should return 401 Unauthorized', function() {

            it('when request body does not have required fields', function(done){
                // prepare
                req.body = {};

                // execute
                testHandler.getInteractionToken(req, res, next);

                // attest
                expectError(engineErrors.Generic.NotAuthorized);

                done();
            });

            it('when username does not match test account pattern', function(done){
                // prepare
                req.body.username = 'user@intel.com';

                // execute
                testHandler.getInteractionToken(req, res, next);

                // attest
                expectError(engineErrors.Generic.NotAuthorized);

                done();
            });

            it('when secret key provided is invalid', function(done){
                // prepare
                req.body.secretKey = 'invalidKey';

                // execute
                testHandler.getInteractionToken(req, res, next);

                // attest
                expectError(engineErrors.Generic.NotAuthorized);

                done();
            });

            it('when password provided is incorrect', function(done) {
                // prepare
                req.body.password = 'wrongPassword';

                usersApiMock.searchUser.callsArgWith(1, null, user);
                userValidatorMock.isPasswordCorrect.returns(Q.reject());

                // execute
                testHandler.getInteractionToken(req, res, function(nextArg) {
                    // attest
                    try {
                        validateSearchUserArgs();
                        validateIsPasswordCorrectArgs();
                        expectArgIsError(nextArg, engineErrors.Generic.NotAuthorized);
                        expect(userInteractionTokenDbMock.new.called).to.equal(false);

                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                // Timeout means next() was not called
            });

        });

        describe('should return correct error', function() {

            it('when user was not found', function(done) {
                // prepare
                usersApiMock.searchUser.callsArgWith(1, null, null);

                // execute
                testHandler.getInteractionToken(req, res, next);

                // attest
                expectError(engineErrors.User.NotFound);

                done();
            });

            it('when db error occured retrieving user', function(done) {
                // prepare
                var error = 'dbError';
                usersApiMock.searchUser.callsArgWith(1, error);

                // execute
                testHandler.getInteractionToken(req, res, next);

                // attest
                expectError(engineErrors.User.NotFound);

                done();
            });

            it('when db error occured retrieving user interaction token', function(done) {
                // prepare
                var error = 'dbError';
                usersApiMock.searchUser.callsArgWith(1, null, user);
                userValidatorMock.isPasswordCorrect.returns(Q.resolve());
                userInteractionTokenDbMock.new.callsArgWith(1, error);

                // execute
                testHandler.getInteractionToken(req, res, function(nextArg) {
                    // attest
                    try {
                        validateSearchUserArgs();
                        validateIsPasswordCorrectArgs();
                        validateUserInteractionTokenArgs();
                        expectArgIsError(nextArg, engineErrors.InteractionToken.NotFound);

                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                // Timeout means next() was not called
            });

            it('when user interaction token cannot be retrieved', function(done) {
                // prepare
                var error = 'dbError';
                usersApiMock.searchUser.callsArgWith(1, null, user);
                userValidatorMock.isPasswordCorrect.returns(Q.resolve());
                userInteractionTokenDbMock.new.callsArgWith(1, null, null);

                // execute
                testHandler.getInteractionToken(req, res, function(nextArg) {
                    // attest
                    try {
                        validateSearchUserArgs();
                        validateIsPasswordCorrectArgs();
                        validateUserInteractionTokenArgs();
                        expectArgIsError(nextArg, engineErrors.InteractionToken.NotFound);

                        done();
                    } catch(err) {
                        done(err);
                    }
                });
                // Timeout means next() was not called
            });

        });

        it('should return token of selected type', function(done) {
            // prepare
            usersApiMock.searchUser.callsArgWith(1, null, user);
            userValidatorMock.isPasswordCorrect.returns(Q.resolve());
            userInteractionTokenDbMock.new.callsArgWith(1, null, token);

            res.send = function(body) {
                // attest
                try {
                    validateSearchUserArgs();
                    validateIsPasswordCorrectArgs();
                    validateUserInteractionTokenArgs();
                    expect(JSON.stringify(body)).to.equal(JSON.stringify({interactionToken: token.id}));

                    done();
                } catch(err) {
                    done(err);
                }
            };

            // execute
            testHandler.getInteractionToken(req, res, next);
            // Timeout means send() was not called
        });

    });

});