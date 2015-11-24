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
    rewire = require('rewire'),
    attributesValidationHelper = rewire('../../../../../engine/handlers/helpers/attributesValidation');

describe('attributes validation helper', function() {
    var attributes, callback;
    beforeEach(function(){
        callback = sinon.spy();
    });

    var validateNoErrorsReturned = function() {
        expect(callback.calledOnce).to.equal(true);
        expect(callback.args[0][0]).to.equal(null);
    };

    describe('should survive', function() {

        it('should survive if attributes is not object', function(done) {
            // prepare
            attributes = [ 'a', 'b', 'c' ];

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateNoErrorsReturned();

            done();
        });

        it('should survive if attributes is not defined', function(done) {
            // execute
            attributesValidationHelper.checkLimitsForAttributes(undefined, callback);

            // attest
            validateNoErrorsReturned();

            done();
        });

    });

    describe('should pass', function() {

        it('if no attributes provided', function(done) {
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);
            validateNoErrorsReturned();
            done();
        });

        it('if key length equals limit', function(done) {
            // prepare
            attributes = {};
            var key =  new Array(attributesValidationHelper.MAX_LENGTH + 1).join('a');
            attributes[key] = 'value';

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateNoErrorsReturned();

            done();
        });

        it('if value length equals limit', function(done) {
            // prepare
            attributes = {};
            var key = 'key';
            var value =  new Array(attributesValidationHelper.MAX_LENGTH + 1).join('a');
            attributes[key] = value;

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateNoErrorsReturned();

            done();
        });

    });

    describe('should fail', function() {

        var validateFirstReturnedErrorStartsWith = function(text) {
            expect(callback.calledOnce).to.equal(true);
            expect(Array.isArray(callback.args[0][0])).to.equal(true);
            expect(callback.args[0][0].length).to.equal(1);
            expect(callback.args[0][0][0].indexOf(text)).to.equal(0);
        };

        it('if too many attributes', function(done) {
            // prepare
            attributes = {};
            for(var i = 0; i < attributesValidationHelper.MAX_COUNT + 1; i++) {
                attributes['attr' + i] = 'val' + i;
            }

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateFirstReturnedErrorStartsWith('Too many attributes.');

            done();
        });

        it('if key is too long', function(done) {
            // prepare
            attributes = {};
            var key =  new Array(attributesValidationHelper.MAX_LENGTH + 2).join('a');
            attributes[key] = 'value';

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateFirstReturnedErrorStartsWith('Attribute key ' + key + ' is too long');

            done();
        });

        it('if value is too long', function(done) {
            // prepare
            attributes = {};
            var key = 'key';
            var value =  new Array(attributesValidationHelper.MAX_LENGTH + 2).join('a');
            attributes[key] = value;

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateFirstReturnedErrorStartsWith('Attribute value ' + value + ' under key ' + key + ' is too long.');

            done();
        });

        it('if key is empty', function(done) {
            // prepare
            attributes = {};
            var key = '';
            var value =  'value';
            attributes[key] = value;

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateFirstReturnedErrorStartsWith('Attribute key ' + key + ' is too short.');

            done();
        });

        it('if value is empty', function(done) {
            // prepare
            attributes = {};
            var key = 'key';
            var value =  '';
            attributes[key] = value;

            // execute
            attributesValidationHelper.checkLimitsForAttributes(attributes, callback);

            // attest
            validateFirstReturnedErrorStartsWith('Attribute value ' + value + ' under key ' + key + ' is too short.');

            done();
        });

    });

});
