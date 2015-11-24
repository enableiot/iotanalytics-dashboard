/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2012 Ofer Reichman
 *
 * Portions Copyright (c) 2014 Intel Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/

var RE_0_TO_100 = '([1-9]?[0-9]|100)';
var RE_0_TO_255 = '([1-9]?[0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])';

function validateFormatUtcMillisec(obj) {
    return obj >= 0;
}

//jshint ignore:start
function validateFormatRegExp(obj) {

    try {
        var re = new RegExp(obj);
        return true;
    } catch (err) {
        return false;
    }
}
//jshint ignore:end

var COLORS = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'];
var colorsReHex3 = /^#[0-9A-Fa-f]{3}$/; // #rgb
var colorsReHex6 = /^#[0-9A-Fa-f]{6}$/; // #rrggbb
var colorsReRgbNum = new RegExp('^rgb\\(\\s*' + RE_0_TO_255 + '(\\s*,\\s*' + RE_0_TO_255 + '\\s*){2}\\)$'); // rgb(255, 0, 128)
var colorsReRgbPerc = new RegExp('^rgb\\(\\s*' + RE_0_TO_100 + '%(\\s*,\\s*' + RE_0_TO_100 + '%\\s*){2}\\)$'); // rgb(100%, 0%, 50%)

function validateFormatColor(obj) {
    return COLORS.indexOf(obj) !== -1 || obj.match(colorsReHex3) || obj.match(colorsReHex6) || obj.match(colorsReRgbNum) || obj.match(colorsReRgbPerc);
}

var phoneReNational = /^(\(\d+\)|\d+)( \d+)*$/;
var phoneReInternational = /^\+\d+( \d+)*$/;

function validateFormatPhone(obj) {
    return obj.match(phoneReNational) || obj.match(phoneReInternational);
}

var formats = {
    'date-time': { // ISO 8601 (YYYY-MM-DDThh:mm:ssZ in UTC time)
        types: ['string'],
        regex: /^\d{4}-\d{2}-\d{2}T[0-2]\d:[0-5]\d:[0-5]\d([.,]\d+)?Z$/
    },
    'date': { // YYYY-MM-DD
        types: ['string'],
        regex: /^\d{4}-\d{2}-\d{2}$/
    },
    'time': { // hh:mm:ss
        types: ['string'],
        regex: /^[0-2]\d:[0-5]\d:[0-5]\d$/
    },
    'utc-millisec': {
        types: ['number', 'integer'],
        func: validateFormatUtcMillisec
    },
    'regex': { // ECMA 262/Perl 5
        types: ['string'],
        //jshint ignore:start
        func: validateFormatRegExp
        //jshint ignore:end
    },
    'color': { // W3C.CR-CSS21-20070719
        types: ['string'],
        func: validateFormatColor
    },
    /* TODO: support style
     * style - A string containing a CSS style definition, based on CSS 2.1 [W3C.CR-CSS21-20070719].
     Example: `'color: red; background-color:#FFF'`.

     'style': { // W3C.CR-CSS21-20070719
     types: ['string'],
     func: validateFormatStyle
     },*/
    'phone': { // E.123
        types: ['string'],
        func: validateFormatPhone
    },
    'uri': {
        types: ['string'],
        regex: new RegExp("^([a-z][a-z0-9+.-]*):(?://(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(\\d*))?(/(?:[a-z0-9-._~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?|(/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?)(?:\\?((?:[a-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*))?$", 'i')
    },
    'email': {
        types: ['string'],
        regex: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    },
    'ip-address': {
        types: ['string'],
        regex: new RegExp('^' + RE_0_TO_255 + '(\\.' + RE_0_TO_255 + '){3}$')
    },
    'ipv6': {
        types: ['string'],
        regex: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
    },
    'host-name': {
        types: ['string'],
        regex: /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
    }
};

exports.formats = formats;
