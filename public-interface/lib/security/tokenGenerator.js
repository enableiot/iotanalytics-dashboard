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
    keyPem = require('./key-pem'),
    uuid = require('node-uuid');

//valid for 20 years

var args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Not enough arguments: ", args + ". Usage: node tokenGenerator.js <user_id> <account_id>:<role> <account_id>:<role> ...");
    process.exit(1);
} else {
    var expireDate = new Date((new Date()).getTime() + 10512000 * 60 * 1000);
    var accounts = {};
    for (var i = 0; i < args.length; i++) {
        var account = args[i].split(':');
        accounts[account[0]] = account[1] || 'admin';
    }
    var userId = args[0];
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

    console.log('Generated token valid until ' + expireDate);
    var token = new jsjws.JWS().generateJWSByKey(header, payload, keyPem.priv_key());
    console.log('Your token: \n\n' + token + "\n\n");
    process.exit(0);
}