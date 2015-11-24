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
    RulesValidator = require('../../../../../engine/api/helpers').rulesValidator,
    Errors = require('../../../../../engine/res/errors').Errors,
    validator = new RulesValidator();

describe('rules validator', function(){
    describe('population', function(){
        it('should return no errors if a rule contains at least one population child - name', function(done){
            // prepare
            var rule = {
                population: {
                    name: 'test'
                },
                conditions: {values: []}
            };
            // execute
            var errors = validator.validate(rule);

            // attest
            expect(errors.length).to.equal(0);

            done();
        });

        it('should return no errors if a rule contains at least one population child - IDs', function(done){
            // prepare
            var rule = {
                population: {
                    ids: ['test']
                },
                conditions: {values: []}
            };
            // execute
            var errors = validator.validate(rule);

            // attest
            expect(errors.length).to.equal(0);

            done();
        });

        it('should return no errors if a rule contains at least one population child - tags', function(done){
            // prepare
            var rule = {
                population: {
                    tags: ['test']
                },
                conditions: {values: []}
            };
            // execute
            var errors = validator.validate(rule);

            // attest
            expect(errors.length).to.equal(0);

            done();
        });

        it('should return errors if a rule does not contain at least one population child ', function(done){
            // prepare
            var rule = {
                population: {},
                conditions: {values: []}
            };
            // execute
            var errors = validator.validate(rule);

            // attest
            expect(errors.length).to.equal(1);
            expect(errors[0]).to.equal(Errors.Rule.Validation.PopulationItemRequired.code);

            done();
        });
    });

    describe('conditions', function(){
        describe('operator', function(){
            it('should return no errors if a rule contains only one condition and not explicit operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Equal',
                                'values': [
                                    '10'
                                ]
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return no errors if a rule contains more than one condition and an explicit operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Equal',
                                'values': [
                                    '10'
                                ]
                            },
                            {
                                'component': {
                                    'name': 'Temp Sensor 2',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Equal',
                                'values': [
                                    '10'
                                ]
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return errors if a rule contains more than one condition and not explicit operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Equal',
                                'values': [
                                    '10'
                                ]
                            },
                            {
                                'component': {
                                    'name': 'Temp Sensor 2',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Equal',
                                'values': [
                                    '10'
                                ]
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.ConditionsOperatorRequired.code);

                done();
            });
        });

        describe('basic', function(){
            it('should return no errors if a rule with basic conditions takes one more than one value for Equal and Not Equal operators', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Equal',
                                'values': ['10', '11', '12']
                            },
                            {
                                'component': {
                                    'name': 'Temp Sensor 2',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Not Equal',
                                'values': ['10', '11', '12']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });
        });

        describe('timebased', function(){
            it('should return no errors if a rule with timebased conditions takes one more than one value for Equal and Not Equal operators', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'time',
                                'operator': 'Equal',
                                'values': ['10', '11', '12'],
                                'timeLimit': 60
                            },
                            {
                                'component': {
                                    'name': 'Temp Sensor 2',
                                    'dataType': 'Number'
                                },
                                'type': 'time',
                                'operator': 'Not Equal',
                                'values': ['10', '11', '12'],
                                'timeLimit': 60
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return no errors if a rule with timebased conditions has timeLimit parameter', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'time',
                                'operator': '>',
                                'values': ['10'],
                                'timeLimit': 60
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return  errors if a rule with timebased conditions has no timeLimit parameter', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'time',
                                'operator': '>',
                                'values': ['10']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.TimeLimitRequired.code);

                done();
            });
        });

        describe('statistics based conditions', function(){
            it('should return no errors if a rule with well formed statistics based conditions', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': '<=',
                                'values': ['-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return errors if a rule with statistics based conditions have Equal operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': 'Equal',
                                'values': ['-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.EqualityOperatorsNotSupported.code);

                done();
            });

            it('should return errors if a rule with statistics based conditions have Not Equal operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': 'Not Equal',
                                'values': ['-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.EqualityOperatorsNotSupported.code);

                done();
            });

            it('should return errors if a rule with statistics based conditions have Not Equal operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': '<=',
                                'values': ['-2']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(3);

                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.BaseLineCalculationLevelRequired.code);
                expect(errors[1]).to.equal(Errors.Rule.Validation.Statistics.BaseLineSecondsBackRequired.code);
                expect(errors[2]).to.equal(Errors.Rule.Validation.Statistics.BaseLineMinimalInstancesRequired.code);

                done();
            });

            it('should return no errors if a rule with statistics based conditions with Between operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': 'Between',
                                'values': ['-2', '2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return errors if a rule with statistics based conditions with Between operator an invalid values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': 'Between',
                                'values': ['2', '-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(2);

                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.BetweenNegativeValueExpected.code);
                expect(errors[1]).to.equal(Errors.Rule.Validation.Statistics.BetweenPositiveValueExpected.code);

                done();
            });

            it('should return no errors if a rule with statistics based conditions with Not Between operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': 'Not Between',
                                'values': ['-2', '2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return errors if a rule with statistics based conditions with Not Between with invalid values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': 'Not Between',
                                'values': ['2', '-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(2);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.BetweenNegativeValueExpected.code);
                expect(errors[1]).to.equal(Errors.Rule.Validation.Statistics.BetweenPositiveValueExpected.code);

                done();
            });

            it('should return errors if a rule with statistics based conditions with ">" with invalid values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': '>',
                                'values': ['-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.GtPositiveValueExpected.code);

                done();
            });

            it('should return errors if a rule with statistics based conditions with ">=" with invalid values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': '>=',
                                'values': ['-2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.GtPositiveValueExpected.code);

                done();
            });

            it('should return errors if a rule with statistics based conditions with "<" with invalid values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': '<',
                                'values': ['2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.LtNegativeValueExpected.code);

                done();
            });

            it('should return errors if a rule with statistics based conditions with "<=" with invalid values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'statistics',
                                'operator': '<',
                                'values': ['2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.Statistics.LtNegativeValueExpected.code);

                done();
            });
        });

        describe('general', function(){
            it('should return no errors if a rule with conditions of non-numerics is a basic condition', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'String'
                                },
                                'type': 'basic',
                                'operator': 'Equal',
                                'values': ['2']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return no errors if a rule with conditions of non-numerics is a timebased condition', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'String'
                                },
                                'type': 'time',
                                'operator': 'Equal',
                                'values': ['2'],
                                'timeLimit': 60
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });

            it('should return errors if a rule with conditions of non-numerics is not a basic condition', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'String'
                                },
                                'type': 'Statistics based condition',
                                'operator': 'Like',
                                'values': ['2'],
                                'baselineCalculationLevel' : 'Device level',
                                'baselineSecondsBack' : 500,
                                'baselineMinimalInstances' : 10

                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.NonNumericMeasures.InvalidCondition.code);

                done();
            });

            it('should return errors if a rule with conditions of non-numeric measures has an operator different from Equal, Not Equal or Like', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'String'
                                },
                                'type': 'basic',
                                'operator': '>',
                                'values': ['2']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.NonNumericMeasures.InvalidOperator.code);

                done();
            });
        });

        describe('operators', function(){
            it('should return errors if a rule with Between operator has to have 2 values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Between',
                                'values': ['2']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.BetweenOperators.TwoValuesExpected.code);

                done();
            });

            it('should return errors if a rule with Not Between operator has to have 2 values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Not Between',
                                'values': ['2', '2', '2']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.BetweenOperators.TwoValuesExpected.code);

                done();
            });

            it('should return errors if a rule with a numeric measure has an invalid operator', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': 'Like',
                                'values': ['2']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.NumericMeasures.InvalidOperator.code);

                done();
            });

            it('should return errors if a rule with a operator different from Equal, Not Equal, Like, Between and Not Between with multiple values', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Number'
                                },
                                'type': 'Basic condition',
                                'operator': '>',
                                'values': ['2', '3']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.equal(Errors.Rule.Validation.MultipleValues.InvalidOperator.code);

                done();
            });

            it('should return no errors if a rule with a Boolean operator with values True or False', function(done){
                // prepare
                var rule = {
                    population: {
                        tags: ['test']
                    },
                    conditions: {
                        operator: 'OR',
                        values: [
                            {
                                'component': {
                                    'name': 'Temp Sensor 1',
                                    'dataType': 'Boolean'
                                },
                                'type': 'basic',
                                'operator': 'Equal',
                                'values': ['True', 'False']
                            }
                        ]
                    }
                };
                // execute
                var errors = validator.validate(rule);

                // attest
                expect(errors.length).to.equal(0);

                done();
            });


        });
    });
});