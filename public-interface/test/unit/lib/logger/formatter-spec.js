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
    formatter = require('./../../../../lib/logger/formatter');

describe('formatter', function(){
    it('should format a log line with all the details', function(done){
        // prepare
        var message = 'testing logging capabilities',
            context = {
                object: {
                    headers: {
                        'x-iotkit-requestid': 'test:' + Math.random(),
                        'x-forwarded-for': 'localhost',
                        'authorization': 'Bearer testtesttesttesttest'
                    },
                    url: '/test',
                    body: {
                        key: 'value'
                    }
                },
                printObject: true
            },
            options = {
                env: 'test',
                machineName: 'myvm',
                maxLines: 100
            },
            formatterInstance = new formatter(options);

        // execute
        var actual = formatterInstance.format(message, 'debug', context);
        // attest
        expect(actual).not.be('undefined');
        var actualObject = actual;
        expect(actualObject).to.have.property('message');
        expect(actualObject).to.have.property('tags');
        expect(actualObject['message']).to.equal(message);
        expect(actualObject['tags'][0]).to.equal('test');
        expect(actualObject.env).to.equal(options.env);
        expect(actualObject.machineName).to.equal(options.machineName);
        expect(actualObject.requestid).to.equal(context.object.headers['x-iotkit-requestid']);
        expect(actualObject.ip).to.equal(context.object.headers['x-forwarded-for']);
        expect(actualObject.url).to.equal(context.object.url);
        expect(actualObject.authorization.indexOf('Bearer') > -1).to.equal(true);
        expect(actualObject.body.indexOf(context.object.body.key) > -1).to.equal(true);
        expect(actualObject.object).not.be('undefined');

        done();
    });

    it('should log request id sent at options', function(done){
        // prepare
        var message = 'testing logging capabilities',
            context = {
                requestId: 'ah:' + Math.random()
            },
            options = {
                env: 'test',
                machineName: 'myvm',
                maxLines: 100
            },
            formatterInstance = new formatter(options);

        // execute
        var actual = formatterInstance.format(message, 'debug', context);

        // attest
        expect(actual).not.be('undefined');
        var actualObject = actual;
        expect(actualObject).to.have.property('message');
        expect(actualObject).to.have.property('tags');
        expect(actualObject['message']).to.equal(message);
        expect(actualObject['tags'][0]).to.equal('ah');
        expect(actualObject.requestid).to.equal(context.requestId);

        done();
    });

    it('should log request id as n/a when it is not send', function(done){
        // prepare
        var message = 'testing logging capabilities',
            options = {
                env: 'test',
                machineName: 'myvm',
                maxLines: 100
            },
            formatterInstance = new formatter(options);

        // execute
        var actual = formatterInstance.format(message, 'debug');

        // attest
        expect(actual).not.be('undefined');
        var actualObject = actual;
        expect(actualObject).to.have.property('message');
        expect(actualObject).to.have.property('tags');
        expect(actualObject['message']).to.equal(message);
        expect(actualObject['tags'].length).to.equal(0);

        done();
    });

    it('should log error information when it is sent', function(done){
        // prepare
        var message = 'testing logging capabilities',
            context = {
                object: new Error('error for testing')
            },
            options = {
                env: 'test',
                machineName: 'myvm',
                maxLines: 100
            },
            formatterInstance = new formatter(options);

        // execute
        var actual = formatterInstance.format(message, 'debug', context);

        // attest
        expect(actual).not.be('undefined');
        var actualObject = actual;
        expect(actualObject).to.have.property('message');
        expect(actualObject).to.have.property('tags');
        expect(actualObject['message']).to.equal(message);
        expect(actualObject).to.have.property('error');
        expect(actualObject.error.message).to.equal(context.object.message);
        expect(actualObject.error.stackTrace).not.be('undefined');

        done();
    });

    it('should not format when using an unknown log level', function(done){
        // prepare
        var message = 'testing logging capabilities',
            options = {
                env: 'test',
                machineName: 'myvm',
                maxLines: 100
            },
            formatterInstance = new formatter(options);

        // execute
        var actual = formatterInstance.format(message, 'test');

        // attest
        expect(actual).not.be('undefined');
        var actualObject = actual;
        expect(actualObject).not.to.have.property('message');
        expect(actualObject).not.to.have.property('tags');

        done();
    });
});