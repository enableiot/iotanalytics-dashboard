# IoT Analytics Dashboard

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

### public-interface

UI and API repo. This repo will contain content external accessible.

### Pre-requirements
- Node.js v0.10.x
    - Latest in https://launchpad.net/~chris-lea/+archive/ubuntu/node.js
    
- grunt-cli
    - npm install grunt-cli

- NGINX up and running.
    - Install latest version from http://wiki.nginx.org/Install

- Install Build Essential
    - sudo apt-get install build-essential
    
- Postgresql server, version >= 9.4, installed and running on default port 5432
    - Install latest version from http://www.postgresql.org/download/

- Git

- Cloud Foundry CLI and Trusted Analytics Platform account (https://github.com/trustedanalytics)

#### Configuring NGINX

Execute the following:
```
cd ./dashboard/public-interface/nginx
./install.sh
```

This script creates a sym link from /nginx/default.conf to /etc/nginx/conf.d/default.conf to activate configuration. Then it creates another sym link from /dashboard/public-interface/dashboard/public to /opt/dashboard/iotkit-dashboard/dashboard/public to make NGINX serves static resources as CDN. Finally it will restart nginx and make some curls for testing that everything is ok.

When using NGINX to access UI or API instead of using por 4001 you should port 80.

##### Troubleshooting
- If nginx is not working properly (not taking our configuration) empty the folder:
    - /etc/nginx/sites-enabled/


### Tests

We are using grunt in order to perform build activities, such static code analysis validation, running unit tests, packaging, etc.

#### Unit tests

For running unit tests you can:

        cd ./dashboard/public-interface
        NODE_ENV=local grunt

## Localization

All UI labels are defined in file - public-interface/dashboard/public/locale/resourceBundle.json. You can edit resourceBoundle.json in order to modify some UI labels.

## Requirements to run

1. Generate a pair RSA keys and put your private and public keys in public-interface/keys/ as private.pem and public.pem
1. Register your domain in Google ReCaptcha at http://www.google.com/recaptcha and set generated values in cloud foundry user-provided service:

        cf cups recaptcha-ups -p "{\"siteKey\":\"${SITE_KEY}\",\"secretKey\":\"${SECRET_KEY}\"}"
        


#### On Trusted Analytics Platform (https://github.com/trustedanalytics)
Before installation, make sure that you are logged into Trusted Analytics Platform with command:
```
cf login
```

1. Create instances with specified name for each of required services from marketplace:
    * PostgreSQL 9.3 or newer with name mypostgres
    * Redis 2.8 or newer with name myredis
    * Smtp service with name mysmtp
    
1. Create following user-provided services with properties filled with real values:

        cf cups dashboard-endpoint-ups -p "{\"host\":\"${ADDRESS}\"}"
        cf cups backend-ups -p "{\"host\":\"${ADDRESS}\"}"
        cf cups websocket-ups -p "{\"username\":\"${USER}\",\"password\":\"${PASSWORD}\"}"
        cf cups rule-engine-credentials-ups -p "{\"username\":\"${USER}\",\"password\":\"${PASSWORD}\"}"
        cf cups mail-ups -p "{\"sender\":\"${SENDER}\"}"
        cf cups recaptcha-ups -p "{\"siteKey\":\"${SITE_KEY}\",\"secretKey\":\"${SECRET_KEY}\"}"
        cf cups dashboard-security-ups -p "{\"private_pem_path\":${PRIVATE_PEM_PATH},\"public_pem_path\":${PUBLIC_PEM_PATH},\"captcha_test_code\":${CAPTCHA_TEST_CODE},\"interaction_token_permision_key\":${INTERACTION_TOKEN_PERMISSION_KEY}}"
        cf cups gateway-credentials-ups -p "{\"username\":\"${USER}\",\"password\":\"${PASSWORD}\"}"

1. Executing ./cf-deploy.sh in main repository catalog builds package and pushes it to CF as an app with name {SPACE}-dashboard where space is currently selected space by cf t -s "SPACE"  
1. Check logs and wait for application start.
