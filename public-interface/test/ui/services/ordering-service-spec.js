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
describe('ordering service', function(){
    var orderingService,
        filterMock = sinon.stub();

    beforeEach(function() {

        module('iotServices', function($provide) {
            $provide.value('$filter', filterMock);
        });

        inject(function($injector) {
            orderingService = $injector.get('orderingService');
        });
    });

    it('should not order data if params.sorting returns null', function(){
        // prepare
        var data = [
                {
                    externalId: 1
                }
            ],
            paramsMock = {
                sorting: function(){return null;},
                orderBy: sinon.spy()
            },
            orderBy = sinon.stub();

        orderBy.withArgs(data).returns(data);
        filterMock.withArgs('orderBy').returns(orderBy);

        // execute
        var actual = orderingService.orderBy(data, paramsMock);

        // attest
        expect(orderBy.calledOnce).to.equal(false);
        expect(paramsMock.orderBy.calledOnce).to.equal(false);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should order data if params.sorting returns length > 0', function(){
        // prepare
        var data = [
                {
                    externalId: 1
                }
            ],
            paramsMock = {
                sorting: function(){return ['test'];},
                orderBy: sinon.spy()
            },
            orderBy = sinon.stub();

        orderBy.withArgs(data).returns(data);
        filterMock.withArgs('orderBy').returns(orderBy);

        // execute
        var actual = orderingService.orderBy(data, paramsMock);

        // attest
        expect(orderBy.calledOnce).to.equal(true);
        expect(paramsMock.orderBy.calledOnce).to.equal(true);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should not order data if params.sorting returns length === 0', function(){
        // prepare
        var data = [
                {
                    externalId: 1
                }
            ],
            paramsMock = {
                sorting: function(){return [];},
                orderBy: sinon.spy()
            },
            orderBy = sinon.stub();

        orderBy.withArgs(data).returns(data);
        filterMock.withArgs('orderBy').returns(orderBy);

        // execute
        var actual = orderingService.orderBy(data, paramsMock);

        // attest
        expect(orderBy.calledOnce).to.equal(false);
        expect(paramsMock.orderBy.calledOnce).to.equal(false);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should order data if params.sorting returns object with properties', function(){
        // prepare
        var data = [
                {
                    externalId: 1
                }
            ],
            paramsMock = {
                sorting: function(){return {test:'test'};},
                orderBy: sinon.spy()
            },
            orderBy = sinon.stub();

        orderBy.withArgs(data).returns(data);
        filterMock.withArgs('orderBy').returns(orderBy);

        // execute
        var actual = orderingService.orderBy(data, paramsMock);

        // attest
        expect(orderBy.calledOnce).to.equal(true);
        expect(paramsMock.orderBy.calledOnce).to.equal(true);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });

    it('should not order data if params.sorting returns length === 0', function(){
        // prepare
        var data = [
                {
                    externalId: 1
                }
            ],
            paramsMock = {
                sorting: function(){return {};},
                orderBy: sinon.spy()
            },
            orderBy = sinon.stub();

        orderBy.withArgs(data).returns(data);
        filterMock.withArgs('orderBy').returns(orderBy);

        // execute
        var actual = orderingService.orderBy(data, paramsMock);

        // attest
        expect(orderBy.calledOnce).to.equal(false);
        expect(paramsMock.orderBy.calledOnce).to.equal(false);
        expect(actual.length).to.equal(1);
        expect(actual[0].externalId).to.equal(data[0].externalId);
    });
});