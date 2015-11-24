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
    errBuilder = require("../../../../../../lib/errorHandler/index").errBuilder,
    compManager = rewire('../../../../../../engine/api/v1/components');

describe('componentsApi.updateComponent', function () {
    it('should update a component if it exists', function (done) {
        // prepare
        var existingComp = {
                id: 'temperature.v2',
                dimension: 'temperature',
                version: '2.0',
                type: 'sensor',
                dataType: 'Number',
                format: 'float',
                min: -150,
                max: 150,
                measureunit: 'Degress Celsius',
                display: 'timeSeries',
                status: 'active',
                href: 'http://localhost/cmpcatalog/temperature.v2'
            },
            updatingComp = {
                max: 200
            },
            domainId = 1,
            baseUrl = 'https://dashboard.enableiot.com',
            componentMock = {
                findByIdAndAccount: sinon.stub().returns(Q.resolve(existingComp)),
                findByDimensionAndAccount: sinon.stub().returns(Q.resolve([existingComp])),
                new: sinon.stub().returns(Q.resolve(updatingComp))
            },
            postgresProviderMock = {
                startTransaction: sinon.stub().returns(Q.resolve()),
                rollback: sinon.stub(),
                commit: sinon.stub()
            },
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);
        compManager.__set__('entityProvider', postgresProviderMock);

        // execute
        compManager.updateComponent({compId: existingComp.id, componentToUpdate: updatingComp, baseUrl: baseUrl, domainId: domainId}, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.equal(true);
                expect(componentMock.findByIdAndAccount.called).to.be.equal(true);
                expect(componentMock.findByDimensionAndAccount.called).to.be.equal(true);
                expect(componentMock.new.called).to.be.equal(true);

                var actual = callback.args[0][1];
                expect(actual.min).to.equal(existingComp.min);
                expect(actual.version).to.equal('2.1');
                expect(actual.id).to.equal('temperature.v2.1');
                expect(actual.href).to.equal(baseUrl + '/temperature.v2.1');
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should call callback with 5400 error code if something weird happens during save', function (done) {
        // prepare
        var existingComp = {
                id: 'temperature.v2',
                dimension: 'temperature',
                version: '2.0',
                type: 'sensor',
                dataType: 'Number',
                format: 'float',
                min: -150,
                max: 150,
                measureunit: 'Degress Celsius',
                display: 'timeSeries',
                status: 'active',
                href: 'http://localhost/cmpcatalog/temperature.v2'
            },
            updatingComp = {
                max: 200
            },
            domainId = 1,
            baseUrl = 'https://dashboard.enableiot.com',
            componentMock = {
                findByIdAndAccount: sinon.stub().returns(Q.resolve(existingComp)),
                findByDimensionAndAccount: sinon.stub().returns(Q.resolve([existingComp])),
                new:  sinon.stub().throws(new Error())
            },
            postgresProviderMock = {
                startTransaction: sinon.stub().returns(Q.resolve()),
                rollback: sinon.stub(),
                commit: sinon.stub()
            },
            callback = sinon.spy();
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);
        compManager.__set__('entityProvider', postgresProviderMock);

        // execute
        compManager.updateComponent({compId: existingComp.id, componentToUpdate: updatingComp, baseUrl: baseUrl, domainId: domainId}, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.equal(true);
                expect(callback.args[0][0].code).to.equal(5400);
                done();
            })
            .catch(function(err){
                done(err);
            });

    });

    it('should call callback with 5404 error code if device does not exist', function (done) {
        // prepare
        var existingComp = {
                id: 'temperature.v2'
            },
            updatingComp = {
                type: 'actuator'
            },
            domainId = 1,
            baseUrl = 'https://dashboard.enableiot.com',
            componentMock = {
                findByIdAndAccount: sinon.stub().returns(Q.resolve(existingComp)),
                findByDimensionAndAccount: sinon.stub().returns(Q.resolve([]))
            },
            postgresProviderMock = {
                startTransaction: sinon.stub().returns(Q.resolve()),
                rollback: sinon.stub(),
                commit: sinon.stub()
            },
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);
        compManager.__set__('entityProvider', postgresProviderMock);

        // execute
        compManager.updateComponent({compId: existingComp.id, componentToUpdate: updatingComp, baseUrl: baseUrl, domainId: domainId}, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.equal(true);
                expect(callback.args[0][0].code).to.equal(5404);

                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});