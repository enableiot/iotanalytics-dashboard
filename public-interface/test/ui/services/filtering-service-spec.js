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
describe('filtering service', function(){
    var filteringService,
        filterMock = sinon.stub();

    beforeEach(function () {

        module('iotServices', function ($provide) {
            $provide.value('$filter', filterMock);
        });

        inject(function ($injector) {
            filteringService = $injector.get('filteringService');
        });
    });

    it('should filter data by basic properties (not status nor priority)', function(){
        // prepare
        var data = [
                {
                    externalId: 1
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            },
            echo = sinon.stub();

        echo.withArgs(data).returns(data);
        paramsMock.filter.withArgs().returns({name: 'test'});
        filterMock.withArgs('filter').returns(echo);

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(echo.calledOnce).to.equal(true);
        expect(filterMock.calledOnce).to.equal(true);
        expect(paramsMock.filter.callCount).to.equal(4);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should filter data by status and there is a match', function(){
        // prepare
        var data = [
                {
                    externalId: 1,
                    status: 'Active'
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            };

        paramsMock.filter.withArgs().returns({status: ['Active']});
        filterMock.withArgs('filter').returns(function(d, f){
            return f(data[0])? [data[0]] : [];
        });

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(paramsMock.filter.callCount).to.equal(3);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should filter data by status and there is not a match', function(){
        // prepare
        var data = [
                {
                    externalId: 1,
                    status: 'Archived'
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            };

        paramsMock.filter.withArgs().returns({status: ['Active']});
        filterMock.withArgs('filter').returns(function(d, f){
            return f(data[0])? [data[0]] : [];
        });

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(paramsMock.filter.callCount).to.equal(3);
        expect(actual.length).to.equal(0);
    });

    it('should filter data by status and there is not a match - object has no such property', function(){
        // prepare
        var data = [
                {
                    externalId: Math.random()
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            };

        paramsMock.filter.withArgs().returns({status: ['Active']});
        filterMock.withArgs('filter').returns(function(d, f){
            return f(data[0])? [data[0]] : [];
        });

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(paramsMock.filter.callCount).to.equal(3);
        expect(actual.length).to.equal(0);
    });

    it('should filter data by status = empty', function(){
        // prepare
        var data = [
                {
                    externalId: Math.random(),
                    status: 'Active'
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            };

        paramsMock.filter.withArgs().returns({status: ['']});
        filterMock.withArgs('filter').returns(function(d, f){
            return f(data[0])? [data[0]] : [];
        });

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(paramsMock.filter.callCount).to.equal(3);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should filter data by priority and there is a match', function(){
        // prepare
        var data = [
                {
                    externalId: Math.random(),
                    priority: 'Low'
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            };

        paramsMock.filter.withArgs().returns({priority: ['Low']});
        filterMock.withArgs('filter').returns(function(d, f){
            return f(data[0])? [data[0]] : [];
        });

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(paramsMock.filter.callCount).to.equal(4);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should filter data by status and priority and there is a match', function(){
        // prepare
        var data = [
                {
                    externalId: Math.random(),
                    status: 'Active',
                    priority: 'Low'
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            };

        paramsMock.filter.withArgs().returns({status: ['Active'], priority: ['Low']});
        filterMock.withArgs('filter').returns(function(d, f){
            return f(data[0])? [data[0]] : [];
        });

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(paramsMock.filter.callCount).to.equal(3);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should filter data by status, priority and others', function(){
        // prepare
        var data = [
                {
                    externalId: Math.random()
                }
            ],
            paramsMock = {
                filter: sinon.stub()
            },
            echo = sinon.stub();

        echo.withArgs(data).returns(data);
        paramsMock.filter.withArgs().returns({status: ['Active'], priority: ['Low'], name: ['rule']});
        filterMock.withArgs('filter').returns(echo);

        // execute
        var actual = filteringService.filterRulesBy(data, paramsMock);

        // attest
        expect(echo.callCount).to.equal(3);
        expect(paramsMock.filter.callCount).to.equal(3);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });
});