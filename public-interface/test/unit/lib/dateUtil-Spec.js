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
    sinon = require('sinon'),
    rewire = require('rewire'),
    dateUtilManager = rewire('../../../lib/dateUtil');

describe("date Utils", function() {

    describe("newTimestamp", function () {

        it('Should get new timestamp', function (done) {
            var now = dateUtilManager.newTimeStamp(),
                result = now <= Date.now() ? true : false;

            expect(result).to.equal(true);

            done();
        });
    });

    describe("dayToSeconds", function () {

        it('Should get amount of seconds for one day', function (done) {
            expect(dateUtilManager.dayToSeconds()).to.equal(1 * 24 * 60 * 60);

            done();
        });

        it('Should get amount of seconds for three day', function (done) {
            expect(dateUtilManager.dayToSeconds(3)).to.equal(3 * 24 * 60 * 60);

            done();
        });
    });

    describe("extractFromAndTo", function () {

        it('Should return default \'from\' and \'to\' without data as argument', function (done) {
            var data = {},
                expectedResult = {
                    from: 0
                };

            var result = dateUtilManager.extractFromAndTo(data);
            expect(result.from).to.equal(expectedResult.from);

            done();
        });

        it('Should return default \'from\' and \'to\' with data as argument', function (done) {
            var data = {
                    to: -100000,
                    from: 10
                },
                expectedResult = {
                    from: 10
                };

            var result = dateUtilManager.extractFromAndTo(data);

            expect(result.from).to.equal(expectedResult.from);
            expect(data.to).to.equal(undefined);
            expect(data.from).to.equal(undefined);

            done();
        });

        it('Should return default \'from\' and \'to\' with negative \'from\' in data', function (done) {
            var data = {
                    to: 100000,
                    from: -10
                },
                expectedResult = {
                    from: data.to + (data.from * 1000)
                };

            var result = dateUtilManager.extractFromAndTo(data);

            expect(result.from).to.equal(expectedResult.from);
            expect(data.to).to.equal(undefined);
            expect(data.from).to.equal(undefined);

            done();
        });
    });
});
