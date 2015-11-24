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

var assert = require('assert'),
    rewire = require('rewire'),
    sinon = require('sinon');

var fileToTest = "../../../lib/cors.js";

describe(fileToTest, function(){
    var toTest = rewire(fileToTest);
    var req = {
            method : "GET",
            headers : {
                origin : true,
                origen : "not star"
            }
        },
        res = {
            header : function(){}
        },
        next = function(){

        };
    var cors = toTest.cors();
    it('enable (XSS) Allow Credentials>', function(){
        res.header = function(name, value){
            var validHeader = (name === 'Access-Control-Allow-Credentials') || (name === 'Access-Control-Allow-Origin') || (name === 'Access-Control-Allow-Methods');
            assert(validHeader, "Invalid header set: " + name);
            assert(value.toString() === 'true' || value.toString() === 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
                , "Access Control should be true or VERBS but it is " + value.toString());
        };

        cors(req, res, next);
    });
    it('enable (XSS) Not Allow Credentials for *>', function(){
        req.headers.origin = "*";

        res.header = function(name, value){
            var validHeader = (name !== 'Access-Control-Allow-Credentials') || (name !== 'Access-Control-Allow-Origin');
            assert(validHeader, "Invalid header set: " + name);
            assert(value.toString() === 'true', "Access Control should be true");
        };

        cors(req, res, next);
    });
    it('enable (XSS) Allow Headers>', function(){
        req.method = "OPTIONS";
        req.headers.origin = false;

        res = {
            send: sinon.spy(),
            status: function(code) {
                assert(code === 200, "Wrong code sent");
                return this;
            }
        };


        res.header = function(name){
            var validHeader = (name === 'Access-Control-Allow-Credentials') || (name === 'Access-Control-Allow-Origin') || (name === 'Access-Control-Allow-Headers');
            assert(validHeader, "Invalid header set");
        };

        cors(req, res, next);
    });
    it('enable (XSS) Allow other VERBS>', function(){
        req.method = "GET";
        req.headers.origin = false;

        res.send = function(){
            assert(false, "Invalid path");
        };
        res.header = function(name){
            var validHeader = (name === 'Access-Control-Allow-Credentials') || (name === 'Access-Control-Allow-Origin') || (name === 'Access-Control-Allow-Headers');
            assert(validHeader, "Invalid header set");
        };

        cors(req, res, next);
    });
});
