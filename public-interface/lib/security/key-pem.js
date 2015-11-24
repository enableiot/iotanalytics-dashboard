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
    fs = require('fs');

var priv_key,
    pub_key;

module.exports = {
    init: function(secConfig){
        var priv_pem = fs.readFileSync(secConfig.private_pem_path, 'utf8');
        priv_key = jsjws.createPrivateKey(priv_pem, 'utf8');

        var pub_pem = fs.readFileSync(secConfig.public_pem_path, 'utf8');
        pub_key = jsjws.createPublicKey(pub_pem, 'utf8');
    },

    priv_key: function(){
        return priv_key;
    },

    pub_key: function(){
        return pub_key;
    }
};
