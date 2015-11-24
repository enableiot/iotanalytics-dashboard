var ngIntroDirective = angular.module('angular-intro', []);

/**
 * TODO: Use isolate scope, but requires angular 1.2: http://plnkr.co/edit/a2c14O?p=preview
 * See: http://stackoverflow.com/q/18796023/237209
 */

ngIntroDirective.directive('ngIntroOptions', ['$timeout', '$parse', 'ipCookie', function ($timeout, $parse, ipCookie) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            scope[attrs.ngIntroMethod] = function(step) {

                var intro;
                var options = scope.$eval(attrs.ngIntroOptions);

                if(typeof(step) === 'string') {
                    intro = introJs(step);
                } else {
                    intro = introJs();
                }

                intro.setOptions(options);

                if(attrs.ngIntroOncomplete) {
                    var fnCompleteCallback = ($parse(attrs.ngIntroOncomplete))(scope);
                }
                intro.oncomplete(function(element){
                    if(options.recordStep) {
                        ipCookie(options.introId + "_step", options.steps.length+1, {expires: 100000});
                    }
                    if (fnCompleteCallback) {
                        fnCompleteCallback(element, options);
                    }
                });


                if(attrs.ngIntroOnexit) {
                    var fnExitCallback = ($parse(attrs.ngIntroOnexit))(scope);
                }
                intro.onexit(function(element){
                    if(options.recordStep) {
                        ipCookie(options.introId + "_step", options.steps.length+1, {expires: 100000});
                    }
                    if (fnExitCallback) {
                        fnExitCallback(element, options);
                    }
                });

                if(attrs.ngIntroOnchange) {
                    var fnChangeCallback = ($parse(attrs.ngIntroOnchange))(scope);
                }
                intro.onchange(function(element){
                    if (options.recordStep) {
                        var currentStep = element.id.split("_")[1] || 0;
                        var maxStep = ipCookie(options.introId + "_step") || 0;
                        if (currentStep > maxStep) {
                            ipCookie(options.introId + "_step", currentStep, {expires: 100000});
                        }
                    }
                    if (fnChangeCallback) {
                        fnChangeCallback(element,options);
                    }
                });

                if(attrs.ngIntroOnbeforechange) {
                    intro.onbeforechange($parse(attrs.ngIntroOnbeforechange)(scope));
                }

                if(attrs.ngIntroOnafterchange) {
                    intro.onafterchange($parse(attrs.ngIntroOnafterchange)(scope));
                }

                if(typeof(step) === 'boolean' && step) {
                    step = ipCookie(options.introId + "_step") || null;
                }
                if(typeof(step) === 'number') {
                    if(step <= (options.steps.length-1)) {
                        intro.goToStep(step).start();
                    }
                } else {
                    intro.start();
                }
            };

            if(attrs.ngIntroAutostart == 'true') {
                $timeout(function() {
                    $parse(attrs.ngIntroMethod)(scope)();
                });
            }
        }
    };
}]);
