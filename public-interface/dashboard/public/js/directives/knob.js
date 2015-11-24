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
iotApp.directive('knob', function(){
    var link = function(scope, element, attrs){
        scope.$watch(attrs.knob, function() {
            angular.element('.' + scope.name).knob({
                width: scope.width,
                height: scope.height,
                max: scope.max || 100,
                angleOffset: scope.angleOffset || 0,
                angleArc : scope.angleArc || 360,
                readOnly: true,
                thickness: scope.thickness,
                fgColor: scope.color,
                draw: function(){
                    // "tron" case
                    if(this.$.data('skin') === 'tron') {

                        var a = this.angle(this.cv),  // Angle
                            sa = this.startAngle,          // Previous start angle
                            sat = this.startAngle,         // Start angle
                            ea,                            // Previous end angle
                            eat = sat + a,                 // End angle
                            r = true;

                        this.g.lineWidth = this.lineWidth;

                        if (this.o.displayPrevious) {
                            ea = this.startAngle + this.angle(this.value);
                            this.g.beginPath();
                            this.g.strokeStyle = this.previousColor;
                            this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                            this.g.stroke();
                        }

                        this.g.beginPath();
                        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                        this.g.stroke();

                        this.g.lineWidth = 2;
                        this.g.beginPath();
                        this.g.strokeStyle = this.o.fgColor;
                        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                        this.g.stroke();

                        return false;
                    }
                }
            });
        });
        scope.$watch('val', function(value){
            angular.element('.' + scope.name)
                .val(value)
                .trigger('change');
        });
    };

    return {
        scope: {
            val: '=ngModel',
            name: '@',
            max: '@',
            width: '@',
            height: '@',
            angleOffset: '@',
            angleArc: '@',
            thickness: '@',
            color: '@',
            showWhen: '@',
            noShowWhen: '@',
            actionHref: '@',
            actionTitle: '@',
            actionText: '@'
        },
        restrict: "E",
        templateUrl: 'public/partials/directives/knob.html',
        link: link
    };
});