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

"use strict";

var expect = require('expect.js'),
    sinon = require('sinon'),
    validator = require('../../../lib/validator');

describe("validator", function() {

    var objectItem = {},
        numericItem = 123,
        stringItem = "abc",
        arrayItem = [];

    describe("isString", function() {
        it('Should return true if item is a string', function (done) {
            var result = validator.isString(stringItem);
            expect(result).to.equal(true);
            done();
        });
        it('Should return false if item is Numeric', function (done) {
            var result = validator.isString(numericItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Undefined', function (done) {
            var result = validator.isString();
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Object', function (done) {
            var result = validator.isString(objectItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Array', function (done) {
            var result = validator.isString(arrayItem);
            expect(result).to.equal(false);
            done();
        });
    });

    describe("isObject", function() {
        it('Should return false if item is a string', function (done) {
            var result = validator.isObject(stringItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Numeric', function (done) {
            var result = validator.isObject(numericItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Undefined', function (done) {
            var result = validator.isObject();
            expect(result).to.equal(false);
            done();
        });
        it('Should return true if item is Object', function (done) {
            var result = validator.isObject(objectItem);
            expect(result).to.equal(true);
            done();
        });
        it('Should return false if item is Array', function (done) {
            var result = validator.isObject(arrayItem);
            expect(result).to.equal(false);
            done();
        });
    });

    describe("isArray", function() {
        it('Should return false if item is a string', function (done) {
            var result = validator.isArray(stringItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Numeric', function (done) {
            var result = validator.isArray(numericItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Undefined', function (done) {
            var result = validator.isArray();
            expect(result).to.equal(false);
            done();
        });
        it('Should return false if item is Object', function (done) {
            var result = validator.isArray(objectItem);
            expect(result).to.equal(false);
            done();
        });
        it('Should return true if item is Array', function (done) {
            var result = validator.isArray(arrayItem);
            expect(result).to.equal(true);
            done();
        });
    });

});