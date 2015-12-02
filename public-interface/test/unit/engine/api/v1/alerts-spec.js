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
    Q = require('q'),
    alertsManager = rewire('../../../../../engine/api/v1/alerts'),
    errors = require('../../../../../engine/res/errors');

describe('alerts api', function(){
    var domain = {
            id: Math.random()
        },
        alert = {
            id: Math.random()
        };

    describe('add comments', function(){
        it('should add comments to given alert', function(){
            // prepare
            var comments = [
                    {
                        alertId: alert.id,
                        user: 'user1@test.com',
                        timestamp: Date.now(),
                        text: 'comment1'
                    },
                    {
                        alertId: alert.id,
                        user: 'user1@test.com',
                        timestamp: Date.now(),
                        text: 'comment1'
                    }
                ],
                dbMock = {
                    addComments: sinon.stub().returns(Q.resolve())
                };

            alertsManager.__set__('Alert', dbMock);

            // execute
            var result = Q.nfcall(alertsManager.addComments, comments);

            // attest
            return result.catch(function(err) {
                expect().fail("Must not fail but failed with error: " + err);
            });
        });

        it('should call callback with Alert.SavingErrorComments error if there is an error when saving comments', function(){
            // prepare
            var comments = [
                    {
                        alertId: alert.id,
                        user: 'user1@test.com',
                        timestamp: Date.now(),
                        text: 'comment1'
                    },
                    {
                        alertId: alert.id,
                        user: 'user1@test.com',
                        timestamp: Date.now(),
                        text: 'comment1'
                    }
                ],
                dbMock = {
                    addComments: sinon.stub().returns(Q.reject("custom error"))
                };

            alertsManager.__set__('Alert', dbMock);

            // execute
            var result = Q.nfcall(alertsManager.addComments, comments);

            // assert
            return result.then(function() {
                expect().fail('Must not succeed');
            }, function(err) {
                expect(err.code).to.equal(errors.Errors.Alert.SavingErrorComments.code);
            });
        });
    });
});
