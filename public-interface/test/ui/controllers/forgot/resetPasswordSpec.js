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

describe('resetPasswordSpec', function(){
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

    it('should cancel', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.spy();

        var window = new winMock();
        ctrl = controllerProvider('ResetPasswordCtrl', {
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
        ctrl = controllerProvider('ResetPasswordCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: { token: 'token' },
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
        ctrl = controllerProvider('ResetPasswordCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: { token: 'token' },
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

    it('should change user password', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.spy();
        usersServiceAPI.getPasswordToken = sinon.stub().callsArgWith(1,
            { email: 'test@user', token: 'token'});
        usersServiceAPI.changePassword = sinon.stub().callsArgWith(2);

        var window = new winMock();
        ctrl = controllerProvider('ResetPasswordCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: { token: 'token' },
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });

        expect(scope.error).to.be.undefined;
        expect(scope.message).to.be.undefined;
        expect(scope.user).not.to.be.undefined;
        expect(scope.socialProvider).to.be.undefined;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.notCalled).to.be.true;
        expect(usersServiceAPI.getPasswordToken.calledOnce).to.be.true;

        scope.password = 'newPass';
        scope.changePassword();

        expect(usersServiceAPI.changePassword.calledOnce).to.be.true;
        expect(scope.error).to.be.undefined;
        expect(scope.message).not.to.be.undefined;
    });

    it('should not change user password - wrong token', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.spy();
        usersServiceAPI.getPasswordToken = sinon.stub().callsArgWith(1,
            { email: 'test@user', token: 'token'});
        usersServiceAPI.changePassword = sinon.stub().callsArgWith(3, {code: 2401, message: "Password too Weak"});

        var window = new winMock();
        ctrl = controllerProvider('ResetPasswordCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: { token: 'token' },
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });

        expect(scope.error).to.be.undefined;
        expect(scope.message).to.be.undefined;
        expect(scope.user).not.to.be.undefined;
        expect(scope.socialProvider).to.be.undefined;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.notCalled).to.be.true;
        expect(usersServiceAPI.getPasswordToken.calledOnce).to.be.true;

        scope.password = 'newPass';
        scope.changePassword();

        expect(usersServiceAPI.changePassword.calledOnce).to.be.true;
        expect(scope.error).not.to.be.undefined;
        expect(scope.message).to.be.undefined;
    });

    it('should disable password change - expired token', function(){
        loginServiceAPI.currentUser = sinon.spy();
        usersServiceAPI.addPasswordToken = sinon.spy();
        usersServiceAPI.getPasswordToken = sinon.stub().callsArgWith(2);
        usersServiceAPI.changePassword = sinon.spy();

        var window = new winMock();
        ctrl = controllerProvider('ResetPasswordCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: { token: 'token' },
            ngResourceBundle: {},
            usersService: usersServiceAPI,
            loginService: loginServiceAPI
        });

        expect(scope.error).not.to.be.undefined;
        expect(scope.message).to.be.undefined;
        expect(scope.user).to.be.undefined;
        expect(scope.socialProvider).to.be.undefined;
        expect(loginServiceAPI.currentUser.calledOnce).to.be.true;
        expect(usersServiceAPI.addPasswordToken.notCalled).to.be.true;
        expect(usersServiceAPI.getPasswordToken.calledOnce).to.be.true;
        expect(usersServiceAPI.changePassword.notCalled).to.be.true;
    });
});