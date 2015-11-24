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

describe('componentsApi.getComponents', function () {
    it('should get all components', function (done) {
        // prepare
        var components = [
                {
                    id: 'temperature.v1'
                },
                {
                    id: 'humidity.v1'
                }
            ],
            domainId = 1,
            baseUrl = 'http://localhost/v1/api/cmpcatalog',
            componentMock = {
                all: sinon.stub().returns(Q.resolve(components))
            },
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);

        // execute
        compManager.getComponents(domainId, baseUrl, null, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.equal(true);
                expect(callback.calledWith(null)).to.equal(true);
                expect(componentMock.all.called).to.be.equal(true);
                expect(callback.args[0].length).to.equal(2);
                expect(callback.args[0][1][0].href).to.equal(baseUrl + '/' + components[0].id);
                expect(callback.args[0][1][1].href).to.equal(baseUrl + '/' + components[1].id);
                done();
            }).catch(function(err){
                done(err);
            });
    });

    it('should call callback with a 5404 error if something weird happens', function (done) {
        // prepare
        var componentMock = {
                all: sinon.stub().returns(Q.resolve(new Error()))
            },
            baseUrl = 'http://localhost/v1/api/cmpcatalog',
            domainId = 1,
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);

        // execute
        compManager.getComponents(domainId, baseUrl, false, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.be.equal(true);
                expect(callback.args[0][0].code).to.be.equal(5404);
                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});

describe('componentsApi.getComponent', function () {
    it('should get a component by its ID lowercased', function (done) {
        // prepare
        var component_id = 'TEMPerature.v1.0',
            component = {
                id: component_id.toLowerCase()
            },
            domainId = 1,
            url = 'http://localhost/v1/api/cmpcatalog/' + component_id,
            componentMock = {
                findByIdAndAccount: sinon.stub().returns(Q.resolve(component))
            },
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);

        // execute
        compManager.getComponent({compId: component_id, domainId: domainId, url: url}, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.equal(true);
                expect(callback.calledWith(null)).to.equal(true);
                expect(componentMock.findByIdAndAccount.called).to.be.equal(true);
                expect(callback.args.length).to.equal(1);
                expect(callback.args[0][1].href).to.equal(url);
                done();
            }).catch(function(err){
                done(err);
            });
    });

    it('should call callback with a 5404 error if component does not exist', function (done) {
        // prepare
        var componentMock = {
                all: sinon.stub().returns(Q.resolve(new Error(5404)))
            },
            domainId = 1,
            url = 'http://localhost/v1/api/cmpcatalog/1',
            callback = sinon.spy();

        compManager.__set__('Component', componentMock);

        // execute
        compManager.getComponents(domainId, url, false, callback)
            .then(function(){
                // attest
                expect(callback.calledOnce).to.be.equal(true);
                expect(callback.args[0][0].code).to.be.equal(5404);
                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});