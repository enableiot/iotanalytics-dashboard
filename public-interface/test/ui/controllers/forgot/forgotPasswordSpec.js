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

describe('forgotPasswordSpec', function(){
    var scope,
        rootScope,
        window,
        controllerProvider,
        ctrl,
        usersServiceAPI,
        loginServiceAPI;

    var winMock = function(){return {}};

    beforeEach(function(){
        module('iotServices');
        module(function($provide){
            $provide.value('ipCookie', {});
        });
    });

    beforeEach(module('iotController'));

    beforeEach(inject(function($controller, $rootScope, $window,
                               usersService, loginService) {
        rootScope = $rootScope;
        window = $window;
        scope = $rootScope.$new();
        controllerProvider = $controller;
        usersServiceAPI = usersService;
        loginServiceAPI = loginService;

        // mocking i18n resources
        rootScope.i18n = { auth: {
            social_message: "some %PROVIDER%",
            bad_token: 'bad token',
            password_changed: "password changed"
        }};

    }));

    it('should ask for a password reset email - existent local user', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.stub().callsArgWith(1, {});

        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });
        scope.email = 'test@user';
        scope.sendMail();

        expect(scope.error).to.be.null;
        expect(scope.message).not.to.be.null;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.null;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.calledOnce).to.be.true;
    });

    it('should ask for a password reset email - existent social user', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.stub().callsArgWith(1, { provider: 'Provider'});

        var window = new winMock();
        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });
        scope.email = 'test@user';
        scope.sendMail();

        expect(scope.error).to.be.null;
        expect(scope.message).not.to.be.null;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.equal('Provider');
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.calledOnce).to.be.true;

        scope.socialLogin();

        expect(window.location).to.be.equal('/ui/auth/Provider');
    });

    it('should ask for a password reset email - user not found', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.stub().callsArgWith(2, { message: 'User not found' });

        var window = new winMock();
        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });
        scope.email = 'test@user';
        scope.sendMail();

        expect(scope.error).not.to.be.null;
        expect(scope.message).to.be.null;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.null;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.calledOnce).to.be.true;
        expect(window.location).to.be.undefined;
    });

    it('should ask for a password reset email - unknown error', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.stub().callsArgWith(2, { error: 'Error' });

        var window = new winMock();
        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });
        scope.email = 'test@user';
        scope.sendMail();

        expect(scope.error).not.to.be.null;
        expect(scope.message).to.be.null;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.null;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.calledOnce).to.be.true;
        expect(window.location).to.be.undefined;
    });

    it('should cancel', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.spy();

        var window = new winMock();
        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });
        scope.cancel();

        expect(scope.error).to.be.undefined;
        expect(scope.message).to.be.undefined;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.undefined;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.notCalled).to.be.true;
        expect(window.location).to.be.equal('/');
    });

    it('should redirect logged in user to addDomain', function(){
        loginServiceAPI.currentUser = sinon.stub().callsArgWith(0, { role: 'guest' });
        usersServiceAPI.addPasswordToken = sinon.spy();

        var window = new winMock();
        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });

        expect(scope.error).to.be.undefined;
        expect(scope.message).to.be.undefined;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.undefined;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.notCalled).to.be.true;
        if(getServicesConfig('verifyUserEmail')) {
            expect(window.location).to.be.equal('/');
        } else {
            expect(window.location).to.be.equal('/ui/dashboard');
        }
    });

    it('should redirect logged in user to Dashboard', function(){
        loginServiceAPI.currentUser = sinon.stub().callsArgWith(0, { role: 'user' });
        usersServiceAPI.addPasswordToken = sinon.spy();

        var window = new winMock();
        ctrl = controllerProvider('ForgotCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });

        expect(scope.error).to.be.undefined;
        expect(scope.message).to.be.undefined;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.undefined;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.notCalled).to.be.true;
        if(getServicesConfig('verifyUserEmail')) {
            expect(window.location).to.be.equal('/');
        } else {
            expect(window.location).to.be.equal('/ui/dashboard');
        }
    });
});