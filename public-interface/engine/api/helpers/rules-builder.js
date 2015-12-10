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
var logger = require('../../../lib/logger').init(),
    moment = require('moment');

var buildConditions = function (user, rule) {

    var conditions = {};
    conditions.values = [];

    // building conditions details
    for (var i = 0; i < rule.conditions.values.length; i++) {
        var c = rule.conditions.values[i];
        var condition = {
            conditionSequence: i + 1,
            component: {
                name: c.component.name,
                dataType: c.component.dataType,
                cid: c.component.cid
            },
            type: c.type,
            operator: c.operator,
            values: []
        };

        for (var j = 0; j < c.values.length; j++) {
            condition.values.push(c.values[j].toString());
        }

        if (i > 0) {
            condition.previousConditionLogicOperator = rule.conditions.operator;
        }
        // Required only for time-dependent conditions.
        if (c.timeLimit) {
            condition.timeLimit = c.timeLimit;
        }
        // Required only for statistics-based conditions.
        if (c.baselineCalculationLevel) {
            condition.baselineCalculationLevel = c.baselineCalculationLevel;
        }
        // Required only for statistics-based conditions.
        if (c.baselineSecondsBack) {
            condition.baselineSecondsBack = c.baselineSecondsBack;
        }
        // Required only for statistics-based conditions.
        if (c.baselineMinimalInstances) {
            condition.baselineMinimalInstances = c.baselineMinimalInstances;
        }

        conditions.values.push(condition);
    }

    if (conditions.values.length > 1) {
        conditions.operator = rule.conditions.operator;
    }

    return conditions;
};

exports.formatRule = function (accountId, user, rule, callback) {
    rule.conditions = buildConditions(user, rule);

    rule.accountId = accountId;
    rule.naturalLanguage = '';

    var basicMessage = function (condition) {
        if (Array.isArray(condition.values) && condition.values.length >= 1) {
            rule.naturalLanguage += condition.component.name + ' ' + condition.operator + ' ';
            if (condition.operator === 'Between' || condition.operator.indexOf('Not') === 0) {  // Between, Not Between, Not Equal
                rule.naturalLanguage += condition.values.join(' and ');
            } else if (condition.operator === 'Equal') {    // Equal
                rule.naturalLanguage += condition.values.join(' or ');
            } else {    // >, <, >=, <=, Like
                rule.naturalLanguage += condition.values[0];
            }
        } else {
            logger.warn('rule proxy. No values in condition.');
        }
    };

    var timeBasedMessage = function (condition) {
        basicMessage(condition);
        rule.naturalLanguage += ' for the last ';
        var time = moment.duration(condition.timeLimit * 1000);
        if (time.years()) {
            rule.naturalLanguage += time.years() + ' years ';
        }
        if (time.months()) {
            rule.naturalLanguage += time.months() + ' months ';
        }
        if (time.days()) {
            rule.naturalLanguage += time.days() + ' days ';
        }
        if (time.hours()) {
            rule.naturalLanguage += time.hours() + ' hours ';
        }
        if (time.minutes()) {
            rule.naturalLanguage += time.minutes() + ' minutes ';
        }
        if (time.seconds()) {
            rule.naturalLanguage += time.seconds() + ' seconds ';
        }
    };

    var buildNaturalLangMsg = function (condition) {
        if (condition.type === 'basic') {
            basicMessage(condition);
        } else if (condition.type === 'time') {
            timeBasedMessage(condition);
        } else if (condition.type === 'statistics') {
            rule.naturalLanguage += condition.component.name + ' ' + condition.operator + ' Statistically defined limits';
        }
    };

    if (Array.isArray(rule.conditions.values)) {
        for (var i = 0; i < rule.conditions.values.length; i++) {
            buildNaturalLangMsg(rule.conditions.values[i]);
            if (rule.conditions.operator && i < rule.conditions.values.length - 1) {
                rule.naturalLanguage += ' ' + rule.conditions.operator + ' ';
            }
        }
    }
    rule.naturalLanguage = rule.naturalLanguage.trim();

    callback(null, rule);
};