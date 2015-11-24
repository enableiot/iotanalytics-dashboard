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
    contextProvider = require('./../../../../lib/context-provider');

describe('context provider', function(){
    it('all', function(done){
        // exercise wrapper
        contextProvider.instance().set('test', 'test');
        contextProvider.instance().get('test');

        // prepare
        var reqMock = {},
            nextSpy = sinon.spy(),
            value = Math.random();

        // execute
        contextProvider.middleware(reqMock, {}, nextSpy);
        contextProvider.instance().set('test', value);

        // attest
        expect(nextSpy.calledOnce).to.equal(true);
        expect(reqMock.contextProvider).not.be('undefined');
        expect(contextProvider.instance().get('test')).to.equal(value);

        done();
    });

    it('double initialization', function(done){
        // prepare
        var reqMock = {},
            nextSpy = sinon.spy(),
            value = Math.random();

        // execute
        contextProvider.middleware(reqMock, {}, nextSpy);
        contextProvider.instance().set('test', 'test');
        contextProvider.middleware(reqMock, {}, nextSpy);
        contextProvider.instance().set('test', value);

        // attest
        expect(nextSpy.calledTwice).to.equal(true);
        expect(contextProvider.instance().get('test')).to.equal(value);
        expect(contextProvider.instance().get('test')).to.equal(value);

        done();
    });
});