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
    rewire = require('rewire'),
    sinon = require('sinon');

var fileToTest = "../../../../lib/websocket/connector";

describe(fileToTest, function(){

    var config = {
        host: "host",
        port: 123456,
        retryTime: 5,
        retriesLimit: 10
    };

    var logger = {
        info : function(){},
        error : function() {},
        debug : function() {}
    };

    var wsConnector = rewire(fileToTest);
    wsConnector.wsConnector = wsConnector.singleton(config, logger);

    it('Shall Connect if not yet connected', function(done) {
        var clientMock = {
            connect: sinon.spy()
        };
        wsConnector.__set__('wsConnector.client', clientMock);
        wsConnector.__set__('wsConnector.connected', false);
        wsConnector.wsConnector.connect();

        expect(clientMock.connect.calledOnce).to.equal(true);
        done();
    });
    it('Shall not call connect function if already connected', function(done) {
        var clientMock = {
            connect: sinon.spy()
        };
        wsConnector.__set__('wsConnector.client', clientMock);
        wsConnector.__set__('wsConnector.connected', true);
        wsConnector.wsConnector.connect();

        expect(clientMock.connect.calledOnce).to.equal(false);
        done();
    });
    it('Shall publish message if already connected', function(done) {
        var connectionMock = {
            sendUTF: sinon.spy()
        };
        wsConnector.__set__('wsConnector.connection', connectionMock);
        wsConnector.__set__('wsConnector.connected', true);

        var message = 'message';
        var messageObject = {
            "type": 'actuation',
            "body": message,
            "credentials": {}
        };
        wsConnector.wsConnector.publish(message);

        expect(connectionMock.sendUTF.calledOnce).to.equal(true);
        expect(connectionMock.sendUTF.calledWith(JSON.stringify(messageObject))).to.equal(true);
        done();
    });
    it('Shall not publish message if not connected', function(done) {
        var connectionMock = {
            sendUTF: sinon.spy()
        };
        wsConnector.__set__('wsConnector.connection', connectionMock);
        wsConnector.__set__('wsConnector.connected', false);
        wsConnector.wsConnector.publish('message');

        expect(connectionMock.sendUTF.calledOnce).to.equal(false);
        done();
    });
    it('Shall not try to publish message if limit of retries is achieved', function(done) {
        var connectionMock = {
            sendUTF: sinon.spy()
        };
        wsConnector.__set__('wsConnector.connection', connectionMock);
        wsConnector.__set__('wsConnector.connected', false);
        wsConnector.__set__('wsConnector.attempts', 999);
        wsConnector.wsConnector.publish('message');

        expect(connectionMock.sendUTF.calledOnce).to.equal(false);
        done();
    });
    it('Shall try to publish message if limit of retries is not achieved', function(done) {
        var clientMock = {
            connect: sinon.spy()
        };
        wsConnector.__set__('wsConnector.client', clientMock);
        wsConnector.__set__('wsConnector.connected', false);
        wsConnector.__set__('wsConnector.attempts', 0);
        wsConnector.wsConnector.publish('message');

        expect(clientMock.connect.called).to.equal(true);
        done();
    });
});
