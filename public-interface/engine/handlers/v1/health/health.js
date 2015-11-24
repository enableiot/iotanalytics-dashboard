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

var pkg = require('../../../../package'),
    httpStatuses = require('../../../res/httpStatuses');

exports.health = function (req, res) {
    var build = [];
    if(pkg.version) {
        build = pkg.version.split('.');
    }
    var major = build[0] || '0';
    var minor = build[1] || '0';
    var patch = build[2] || '0';
    var revision = build[3] || 'unknown';
    var data = {
        kind : 'healthcheck',
        isHealthy: true,
        currentSetting: process.env.NODE_ENV,
        name: pkg.name,
        build: major + '.' + minor + '.' + patch,
        revision: revision,
        //aa_build: aa_build_version,
        date: pkg.date,
        items: []
    };
    res.writeHead(httpStatuses.OK.code, {'Content-Type': 'application/json; charset=utf-8'});
    res.write(JSON.stringify(data, null, 4));
    res.end();
};