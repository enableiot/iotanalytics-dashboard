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
    userValidator = rewire('../../../../lib/security/userValidator'),
    Q = require('q');

describe("User validator", function () {
    var configMock;

    var userWithEmailVerified,
        userWithEmailNotVerified;

    function prepareUserStubs() {
        userWithEmailVerified = {
            email:'text@example.com',
            password: 'password',
            verified: true
        };
        userWithEmailNotVerified = {
            email:'text@example.com',
            password: 'password',
            verified: false
        }
    }

    function prepareMocks() {
        configMock = {
            verifyUserEmail: true
        };
    }

    beforeEach(function () {
        prepareUserStubs();
        prepareMocks();
        userValidator.__set__('config', configMock);
        Q.longStackSupport = true;
    });

    it('Should return success for user, who has verify his email', function (done) {

        var emailVerified = sinon.spy();
        var emailNotVerified = sinon.spy();

        userValidator.isEmailVerified(userWithEmailVerified)
            .then(function () {
                emailVerified();
            }, function () {
                emailNotVerified();
            })
            .finally(function () {
                expect(emailVerified.calledOnce).to.be(true);
                expect(emailNotVerified.notCalled).to.be(true);
                done();
            });
    });

    it('Should return error for user, who has not verify his email', function (done) {

        var emailVerified = sinon.spy();
        var emailNotVerified = sinon.spy();

        userValidator.isEmailVerified(userWithEmailNotVerified)
            .then(function () {
                emailVerified();
            }, function () {
                emailNotVerified();
            })
            .finally(function () {
                expect(emailVerified.notCalled).to.be(true);
                expect(emailNotVerified.calledOnce).to.be(true);
                done();
            });
    });

    it('Should return success for user, who has not verify his email in case when verifyUserEmail is set to false in config', function (done) {

        configMock.verifyUserEmail = false;
        userValidator.__set__('config', configMock);

        var emailVerified = sinon.spy();
        var emailNotVerified = sinon.spy();

        userValidator.isEmailVerified(userWithEmailNotVerified)
            .then(function () {
                emailVerified();
            }, function () {
                emailNotVerified();
            })
            .finally(function () {
                expect(emailVerified.calledOnce).to.be(true);
                expect(emailNotVerified.notCalled).to.be(true);
                done();
            });
    });
});