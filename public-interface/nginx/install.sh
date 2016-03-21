#!/bin/bash
############################################################################
#                   Copyright (c) 2014 Intel Corporation                   #
#                                                                          #
#  Licensed under the Apache License, Version 2.0 (the "License");         #
#  you may not use this file except in compliance with the License.        #
#  You may obtain a copy of the License at                                 #
#                                                                          #
#                http://www.apache.org/licenses/LICENSE-2.0                #
#                                                                          #
#  Unless required by applicable law or agreed to in writing, software     #
#  distributed under the License is distributed on an "AS IS" BASIS,       #
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.#
#  See the License for the specific language governing permissions and     #
#  limitations under the License.                                          #
############################################################################


export BASE_DIR="${PWD}"
export INSTALL_DIR="/opt/dashboard/iotkit-dashboard/dashboard/"

# create symbolic link to nginx config file
sudo rm -f /etc/nginx/conf.d/default.conf
sudo cp "${BASE_DIR}/default.conf" /etc/nginx/conf.d/
echo "default.conf installed"

# create symbolic link to dashboard/public to make nginx serves as CDN
sudo mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"
sudo rm -f public
sudo ln -s "${BASE_DIR}/../dashboard/public" public
echo "symbolic link to dashboard/public created"

# restart nginx to use new configuration
sudo service nginx restart

# do some request to validate that everything is ok
curl -s -3 --noproxy localhost, "http://localhost/ui/public/lib/angular/angular.js"
echo -e "\n\n"
curl -s -# --noproxy localhost, "http://localhost/v1/api/health"
echo -e "\n\n"

echo "WELL DONE!"