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

var jsjws = require('jsjws'),
    config = require('./config'),
    keyPem = require('./key-pem');

//Generates provided number of tokens valid for 20 years that can be used for test users authorization.

var args = process.argv.slice(2);
if (args.length < 3) {
    console.error("Not enough arguments: ", args + ". Usage: node tokenGenerator.js <prefix> <count> <offset>");
    process.exit(1);
} else {
    var prefix = args[0];
    var count = parseInt(args[1]);
    var offset = parseInt(args[2]);
    var expireDate = new Date((new Date()).getTime() + 10512000 * 60 * 1000);
    var ids = [];

    for(var i = offset; i < count + offset; i++) {
        ids.push(i);
    }

    var  now = new Date().getTime();
    while(new Date().getTime() < now + count * 10) { }

    ids.map(function(i) {
        var accounts = {};
        accounts[prefix + '_' + i] = "admin";
        var userId = prefix + '_User_' + i;
        var role = null;

        keyPem.init(config);
        var header = {
            typ: "JWT",
            alg: config.alg
        };
        var payload = {
            jti: uuid.v4(),
            iss: config.iss,
            sub: userId,
            exp: expireDate,
            accounts: accounts,
            role: role
        };
        var token = new jsjws.JWS().generateJWSByKey(header, payload, keyPem.priv_key());
        console.log(prefix + '_' + i + ',' + token );
    });
}
