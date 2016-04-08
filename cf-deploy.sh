#!/bin/bash -x
# Copyright (c) 2015 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

function check_return {
	echo "$RETURN"
	FAILED=$(echo $RETURN | grep "FAILED" | wc -l)

	if [ "$FAILED" -eq 1 ]
	then
		exit 1
	fi
}


cd public-interface
CURRENT_PATH=`pwd`

GRUNT=${CURRENT_PATH}/node_modules/grunt-cli/bin/grunt
TARGET=(`cf t | grep "Space"`)
SPACE=${TARGET[1]}

${GRUNT} build &&
cd ../ &&

RETURN=("$(cf push ${SPACE}-dashboard)")

check_return

exit 0



