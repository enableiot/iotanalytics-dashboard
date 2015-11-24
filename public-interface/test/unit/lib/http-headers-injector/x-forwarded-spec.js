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
    rewire = require('rewire'),
    sinon = require('sinon'),
    fwd = require('./../../../../lib/http-headers-injector').forwardedHeaders;

describe('x-forwarded', function(){
    it('should inject headers to request if they exist', function(done){
        // prepare
        var reqMock = {
                headers: {
                    "x-forwarded-host": "ci-dashboard.intel.com",
                    "x-forwarded-proto": "https"
                }
            },
            nextSpy = sinon.spy();

        // execute
        fwd(reqMock, {}, nextSpy);

        // attest
        expect(nextSpy.calledOnce).to.equal(true);
        expect(nextSpy.args[0].length).to.equal(0);
        expect(reqMock.forwardedHeaders.baseUrl).to.equal(reqMock.headers['x-forwarded-proto'] + '://' + reqMock.headers['x-forwarded-host']);

        done();
    });
});