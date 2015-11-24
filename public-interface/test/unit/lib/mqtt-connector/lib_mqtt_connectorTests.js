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

var assert =  require('chai').assert,
    rewire = require('rewire');


var fileToTest = "../../../../lib/mqtt/connector";

describe(fileToTest, function(){
    var toTest = rewire(fileToTest);

   var mqtt = {
            createSecureClient : function() {},
            createClient : function() {},
            MqttClient: function () {
                        this.subscribe = {};
                        this.publish = {};
                        this.on = function(){};
                 }
            };
    var logger  = {
        info : function(){},
        error : function() {},
        debug : function() {}
    };

    console.debug = function() {
        console.log(arguments);
    };
    beforeEach(function (done){
        toTest.__set__("broker", null);
        done();
    });
    it('Shall Connect to Specific Broker using None Secure Connection >', function(done){
        toTest.__set__("mqtt", mqtt);

        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            };

        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        mqtt.createClient = function (port, host ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");

            client.connected = true;
            return client;
        };

        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall returned");
            done();
        });
    });
    it('Shall Connect to Specific Broker using Secure Connection >', function(done){
        toTest.__set__("mqtt", mqtt);
        var config = {
                    host: "myHosttest",
                    port: 9090909,
                    secure: true,
                    retries: 2
                    };
        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        mqtt.createSecureClient = function (port, host, args ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = true;
            return client;
        };
        myBroker.connect(function(err) {
            assert.isNull(err, "Not Spected error Returned");
            done();
        });
    });
    it('Shall Catch a Exception at Connect >', function(done){
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: true,
                retries: 2
            };;
        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        mqtt.createSecureClient = function () {
            client.connected = false;
            throw new Error("Invalid Command");
        };
        myBroker.connect(function(err) {
            assert.instanceOf(err, Error, "Shallbe an error Returned");
            done();
        });
    });
    it('Shall Retries to Connect to Specific Broker >', function(done){
        toTest.__set__("mqtt", mqtt);

        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: true,
                retries: 5
            };

        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();

        mqtt.createSecureClient = function (port, host, args ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = false;
            return client;
        };


        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall be returned");
            done();
        });

        setTimeout(function(){
           client.connected = true;
        }, 1000);


    });
    it('Shall Report Error After # Retries >', function(done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: true,
                retries: 2
            };
        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        mqtt.createSecureClient = function (port, host, args ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = false;
            return client;
        };
        myBroker.connect(function(err) {
            assert.instanceOf(err, Error, "Invalid error reported");
            assert.equal(err.message, "Connection Error", "Invalid Message error  Reported");
            done();
        });
    });
    it('Shall Publish to Specific Broker Topic >', function(done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: true,
                retries: 12
            };
        var myTopic ="/device/topox/{1}/xxxx";
        var myMessage = {
            a: "test",
            b: 12323
        };
        var crd = {
            username: "TuUser",
            password: "tuPassword"
        };
        var client = new mqtt.MqttClient();
        mqtt.createSecureClient = function (port, host, args ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            assert.equal(args.username, crd.username, "The user was override");
            assert.equal(args.password, crd.password, "The user was override");
            client.connected = true;
            return client;
        };


        var myBroker = toTest.singleton(config, logger);
        myBroker.setCredential(crd);
        client.publish = function (topic, message) {
            assert.equal(topic, myTopic, "Missing the topics");
            assert.equal(message, JSON.stringify(myMessage), "Missing the Message");
            done();
        };
        myBroker.connect(function(err) {
            assert.isNull(err, Error, "Invalid error reported");
            myBroker.publish(myTopic, myMessage);
        });


    });
    it('Shall Notified to Specific topic handler >', function (done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            },
            id = "0a-03-12-22";
        var realTopic = 'dev/' + id + '/act';
        var msg = {
            a: 1,
            c: 2
        };
        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        mqtt.createClient = function (port, host ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = true;
            return client;
        };
        var topicPattern = 'dev/+/act' ;
        var topicHandler = function(topic) {
            assert.equal(topic, realTopic, "The topis is not the expected");
            done();
        };
        client.subscribe = function (vtopic, cb) {
            var granted = [{ topic: vtopic}];
            cb(null, granted);
        };
        myBroker.connect(function(err) {
           assert.isNull(err, "None error shall returned");
           myBroker.bind(topicPattern, topicHandler);
           myBroker.onMessage(realTopic, msg);
        });
    });
    it('Shall Listen to on Message >', function (done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            },
            id = "0a-03-12-22";
        var msg = {
            a: 1,
            c: 2
        };
        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        var callHandler = null;
        client.on = function (event, handler) {
            assert.isFunction(handler, "The handle shall be a function");
            assert.isString(event, "The event shall be string");
            assert.equal(event, "message", "Invalid event listener");
            callHandler = handler;
        };

        mqtt.createClient = function (port, host ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = true;
            return client;
        };



        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall returned");
            callHandler("conmector", JSON.stringify(msg));
            done();
        });
    });
    it('Shall Listen to on Message > with specific topic handler >', function (done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            },
            id = "0a-03-12-22";
        var realTopic = 'dev/' + id + '/act';
        var msg = {
            a: 1,
            c: 2
        };
        var callHandler = null;
        var client = new mqtt.MqttClient();
        client.on = function (event, handler) {
            assert.isFunction(handler, "The handle shall be a function");
            assert.isString(event, "The event shall be string");
            assert.equal(event, "message", "Invalid event listener");
            callHandler = handler;
        };

        var myBroker = toTest.singleton(config, logger);

        mqtt.createClient = function (port, host ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = true;
            return client;
        };
        var topicPattern = 'dev/+/act' ;
        var topicHandler = function(topic, message) {
            assert.equal(topic, realTopic, "The topis is not the expected");
            assert.deepEqual(message, msg, "The message is missing");
            done();
        };
        client.subscribe = function (vtopic, cb) {
            var granted = [{ topic: vtopic}];
            cb(null, granted);
        };
        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall returned");
            myBroker.bind(topicPattern, topicHandler);
            callHandler("dev/"+id+"/act", JSON.stringify(msg));
        });
    });
    it('Shall Listen to on Message > discard improper message format >', function (done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            },
            id = "0a-03-12-22";
        var callHandler = null;
        var client = new mqtt.MqttClient();
        client.on = function (event, handler) {
            assert.isFunction(handler, "The handle shall be a function");
            assert.isString(event, "The event shall be string");
            assert.equal(event, "message", "Invalid event listeneter");
            callHandler = handler;
        };
        var crd = {
            username: "TuUser",
            password: "tuPassword"
        };
        var myBroker = toTest.singleton(config, logger);
        mqtt.createClient = function (port, host, credencial ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            assert.equal(credencial.username, crd.username, "The user was override");
            assert.equal(credencial.password, crd.password, "The user was override");
            client.connected = true;
            return client;
        };
        var topicPattern = 'dev/+/act' ;
        var topicHandler = function(topic) {
            assert.isFalse(topic, "Wrong path, the messaga shall be discarded");

        };
        client.subscribe = function (vtopic, cb) {
            var granted = [{ topic: vtopic}];
            cb(null, granted);
        };
        myBroker.setCredential(crd);
        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall returned");
            myBroker.bind(topicPattern, topicHandler);
            callHandler("dev/"+id+"/act", "pepep");
            done();
        });
    });
    it('Shall Listen to on Message > with specific topic handler >', function (done) {
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            },
            id = "0a-03-12-22";
        var realTopic = 'dev/' + id + '/act';
        var msg = {
            a: 1,
            c: 2
        };
        var callHandler = null;
        var client = new mqtt.MqttClient();
        client.on = function (event, handler) {
            assert.isFunction(handler, "The handle shall be a function");
            assert.isString(event, "The event shall be string");
            assert.equal(event, "message", "Invalid event listeneter");
            callHandler = handler;
        };

        var myBroker = toTest.singleton(config, logger);

        mqtt.createClient = function (port, host ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = true;
            return client;
        };
        var topicPattern = 'dev/+/act' ;
        var topicHandler = function(topic, message) {
            assert.equal(topic, realTopic, "The topis is not the expected");
            assert.deepEqual(message, msg, "The message is missing");
            done();
        };
        client.subscribe = function (vtopic, cb) {
            var granted = [{ topic: vtopic}];
            cb(null, granted);
        };
        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall returned");
            myBroker.bind(topicPattern, topicHandler, function() {
                callHandler("dev/"+id+"/act", JSON.stringify(msg));
            });
        });
    });
    it('Shall Disconnect from Broker>', function(done){
        toTest.__set__("mqtt", mqtt);
        var config = {
                host: "myHosttest",
                port: 9090909,
                secure: false,
                retries: 2
            };
        var myBroker = toTest.singleton(config, logger);
        var client = new mqtt.MqttClient();
        mqtt.createClient = function (port, host ) {
            assert.lengthOf(arguments, 3, "Missing Argument for Secure Connection");
            assert.equal(port, config.port, "The port has override");
            assert.equal(host, config.host, "The host has override");
            client.connected = true;
            return client;
        };
        client.end = function () {
            done();
        };
        myBroker.connect(function(err) {
            assert.isNull(err, "None error shall returned");
            myBroker.disconnect();
        });
    });
});
