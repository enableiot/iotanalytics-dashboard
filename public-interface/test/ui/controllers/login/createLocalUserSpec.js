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

describe('createLocalUserSpec', function(){
    var scope,
        rootScope,
        window,
        controllerProvider,
        ctrl,
        accountsServiceAPI,
        usersServiceAPI,
        loginServiceAPI,
        sessionServiceMock,
        vcRecaptchaServiceMock;

    beforeEach(module(function ($provide) {
        vcRecaptchaServiceMock = {
            data: function() {
                var data = {
                    response: 's09ef48213s8fe8fw8rwer5489wr8wd5',
                    challenge: '1234567890'
                };
                return data;
            },
            reload: sinon.spy()
        };
        $provide.value('vcRecaptchaService', vcRecaptchaServiceMock)
    }));
    beforeEach(module('iotServices'));
    beforeEach(function(){
        module('iotServices');
        module(function($provide){
            $provide.value('ipCookie', {});
        });
    });
    beforeEach(module('iotController'));

    beforeEach(inject(function($controller, $rootScope, $window,
                               accountsService, usersService, loginService) {
        rootScope = $rootScope;
        window = $window;
        scope = $rootScope.$new();
        controllerProvider = $controller;
        accountsServiceAPI = accountsService;
        usersServiceAPI = usersService;
        loginServiceAPI = loginService;

        // mocking i18n resources
        rootScope.i18n = { auth: {
                            password_weak: 'weakness',
                            email_conflict: 'email conflict'
                         }};

    }));

    beforeEach(function () {
        sessionServiceMock = {
            getJwt: sinon.spy(),
            setJwt: sinon.spy(),
            clearJwt: sinon.spy()
        };
    });

    it('should create user and domain', function(){
        loginServiceAPI.login = sinon.stub().callsArgWith(1, {
            token: 'testToken'
        });
        usersServiceAPI.addUser = sinon.stub().callsArgWith(1);
        usersServiceAPI.deleteUser = sinon.spy();
        accountsServiceAPI.addDomain = sinon.stub().callsArgWith(1);
        loginServiceAPI.refreshToken = sinon.stub().callsArgWith(0, {
            token: "new Token"
        });
        var window ={};
        ctrl = controllerProvider('LoginCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            accountsService: accountsServiceAPI,
            usersService: usersServiceAPI,
            loginService: loginServiceAPI,
            sessionService: sessionServiceMock
        });
        scope.email = 'test@user';
        scope.password = 'TestPwd1';
        loginServiceAPI.currentUser = sinon.stub().callsArgWith(0, {
            email: 'test@user',
            role: 'guest'
        });
        scope.addUser();

        expect(sessionServiceMock.setJwt.notCalled).to.be.equal(true);
        if(getServicesConfig('verifyUserEmail')) {
            expect(window.location).to.equal("/ui/auth#/validate");
        } else {
            expect(window.location).to.equal("/ui/auth#/no_validate");
        }

        expect(usersServiceAPI.addUser.calledOnce).to.be.equal(true);
        expect(usersServiceAPI.deleteUser.notCalled).to.be.equal(true);
    });

    it('should fail due to conflict', function(){
        loginServiceAPI.login = sinon.spy();
        usersServiceAPI.addUser = sinon.stub().callsArgWith(2, { message: 'conflict'} );
        usersServiceAPI.deleteUser = sinon.spy();
        accountsServiceAPI.addDomain = sinon.spy();
        loginServiceAPI.refreshToken = sinon.spy();

        var window = {};
        ctrl = controllerProvider('LoginCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            accountsService: accountsServiceAPI,
            usersService: usersServiceAPI,
            loginService: loginServiceAPI,
            sessionService: sessionServiceMock
        });

        expect(scope.error).to.equal(undefined);
        scope.email = 'test@user';
        scope.password = 'TestPwd1';
        scope.addUser();

        expect(scope.error).not.to.equal(undefined);
        expect(window.location).to.equal(undefined);
        expect(sessionServiceMock.setJwt.notCalled).to.be.equal(true);
        expect(accountsServiceAPI.addDomain.notCalled).to.be.equal(true);
        expect(loginServiceAPI.refreshToken.notCalled).to.be.equal(true);
        expect(usersServiceAPI.addUser.calledOnce).to.be.equal(true);
        expect(usersServiceAPI.deleteUser.notCalled).to.be.equal(true);
    });

    it('should fail due to none proper password', function(){
        loginServiceAPI.login = sinon.spy();
        usersServiceAPI.addUser = sinon.stub().callsArgWith(2, { message: 'conflict'} );
        usersServiceAPI.deleteUser = sinon.spy();
        accountsServiceAPI.addDomain = sinon.spy();
        loginServiceAPI.refreshToken = sinon.spy();

        var window = {};
        ctrl = controllerProvider('LoginCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $window: window,
            $routeParams: {},
            ngResourceBundle: {},
            accountsService: accountsServiceAPI,
            usersService: usersServiceAPI,
            loginService: loginServiceAPI,
            sessionService: sessionServiceMock
        });

        expect(scope.error).to.equal(undefined);
        scope.email = 'test@user';
        scope.password = 'Test';
        scope.addUser();

        expect(scope.error).not.to.equal(undefined);
        expect(window.location).to.equal(undefined);
        expect(sessionServiceMock.setJwt.notCalled).to.be.equal(true);
        expect(accountsServiceAPI.addDomain.notCalled).to.be.equal(true);
        expect(loginServiceAPI.refreshToken.notCalled).to.be.equal(true);
        expect(usersServiceAPI.addUser.called).to.be.equal(false);
        expect(usersServiceAPI.deleteUser.notCalled).to.be.equal(true);
        expect(scope.error).to.be.equal(rootScope.i18n.auth.password_weak);
    });
});