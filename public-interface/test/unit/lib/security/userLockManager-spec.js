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
    userLockManager = rewire('../../../../lib/security/userLockManager'),
    Q = require('q');

describe("User lock manager", function () {

    var success = null;

    var userLockLimitNotExceeded,
        userLockLimitExceeded,
        userLockTtlEnded;

    var configMock,
        userLocksMock;

    function prepareUserLockStubs() {
        userLockLimitNotExceeded = {
            loginFailedCount: 1,
            updated: 1414419451455,
            lockPeriod: 0
        };

        userLockLimitExceeded = {
            loginFailedCount: configMock.login.maxUnsuccessfulAttempts + 1,
            updated: Date.now(),
            lockPeriod: 60000
        };

        userLockTtlEnded = {
            loginFailedCount: configMock.login.maxUnsuccessfulAttempts + 1,
            updated: 0,
            lockPeriod: 0
        };
    }

    function prepareMocks() {
        configMock = {
            login: {
                maxUnsuccessfulAttempts: 10,
                lockIntervalLength: 30,
                lockLivePeriod: 3600
            }
        };

        userLocksMock = {
            increaseLoginLockPeriod: sinon.stub().callsArgWith(2, success, userLockLimitExceeded),
            getLoginLockPeriod: sinon.stub().callsArgWith(1, success, -1),
            incrementLoginFailedCounter: sinon.stub().callsArgWith(1, success, userLockLimitExceeded),
            deleteByEmail: sinon.stub().callsArgWith(1, success)

        };
    }

    beforeEach(function () {
        prepareMocks();
        prepareUserLockStubs();
        userLockManager.__set__('userLocks', userLocksMock);
        userLockManager.__set__('config', configMock);
        Q.longStackSupport = true;
    });

    it('Should not locked user, who has not any login failed attempts', function (done) {

        var userLocked = sinon.spy();
        var userNotLocked = sinon.spy();


        userLockManager.isUserLocked('test@example.com')
            .then(function () {
                userLocked();
            }, function () {
                userNotLocked();
            })
            .finally(function () {
                expect(userLocked.notCalled).to.be(true);
                expect(userNotLocked.calledOnce).to.be(true);
                done();
            });
    });


    it('Should not locked user, who does not exceed max login failed attempts', function (done) {

        var userLocked = sinon.spy();
        var userNotLocked = sinon.spy();


        userLockManager.isUserLocked('test@example.com')
            .then(function () {
                userLocked();
            }, function () {
                userNotLocked();
            })
            .finally(function () {
                expect(userLocked.notCalled).to.be(true);
                expect(userNotLocked.calledOnce).to.be(true);
                done();
            });
    });

    it('Should lock user, who exceed max login failed attempts ', function (done) {

        var userLocked = sinon.spy();
        var userNotLocked = sinon.spy();
        var timeToReset = null;

        userLocksMock.getLoginLockPeriod.callsArgWith(1, success, 1);

        userLockManager.isUserLocked('test@example.com')
            .then(function (time) {
                userLocked();
                timeToReset = time;
            }, function () {
                userNotLocked();
            })
            .finally(function () {
                expect(userLocked.calledOnce).to.be(true);
                expect(userNotLocked.notCalled).to.be(true);
                expect(timeToReset).to.be.a('number');
                //TimeToReset should be a positive number
                expect(timeToReset).to.be.greaterThan(0);
                done();
            });
    });



    it('Should not increase login lock period for user, who does not exceed max number of login failed attempts', function (done) {

        userLocksMock.increaseLoginLockPeriod = sinon.stub().callsArgWith(2, success, userLockLimitNotExceeded);
        userLocksMock.incrementLoginFailedCounter = sinon.stub().callsArgWith(1, success, userLockLimitNotExceeded);

        var success = sinon.spy();
        var error = sinon.spy();

        var increaseLoginLockPeriod = sinon.stub().yields(success);
        userLockManager.__set__('increaseLoginLockPeriod', increaseLoginLockPeriod);

        userLockManager.incrementLoginFailedCount('test@example.com')
            .then(function () {
                success();
            }, function () {
                error();
            })
            .finally(function () {
                expect(error.notCalled).to.be(true);
                expect(success.calledOnce).to.be(true);
                expect(increaseLoginLockPeriod.notCalled).to.equal(true);
                done();
            });

    });

    it('Should increase login lock period for user, who exceeds max number of login failed attempts', function (done) {
        userLocksMock.increaseLoginLockPeriod = sinon.stub().callsArgWith(2, success, userLockLimitExceeded);
        userLocksMock.incrementLoginFailedCounter = sinon.stub().callsArgWith(1, success, configMock.login.maxUnsuccessfulAttempts + 1);

        var success = sinon.spy();
        var error = sinon.spy();

        var increaseLoginLockPeriod = sinon.stub().withArgs('test@example.com', 30000).returns(Q.resolve());
        userLockManager.__set__('increaseLoginLockPeriod', increaseLoginLockPeriod);

        userLockManager.incrementLoginFailedCount('test@example.com')
            .then(function () {
                success();
            }, function () {
                error();
            })
            .finally(function () {
                expect(error.notCalled).to.be(true);
                expect(success.calledOnce).to.be(true);
                expect(increaseLoginLockPeriod.calledOnce).to.equal(true);
                done();
            });

    });
});