-----------------------------------------------------------------------------
--  Copyright (c) 2014 Intel Corporation
--
--  Licensed under the Apache License, Version 2.0 (the "License");
--  you may not use this file except in compliance with the License.
--  You may obtain a copy of the License at
--
--      http://www.apache.org/licenses/LICENSE-2.0
--
--  Unless required by applicable law or agreed to in writing, software
--  distributed under the License is distributed on an "AS IS" BASIS,
--  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
--  See the License for the specific language governing permissions and
--  limitations under the License.
-----------------------------------------------------------------------------


DO $$
    BEGIN
        BEGIN
            ALTER TABLE "dashboard"."alerts"
                ADD COLUMN "dashboardAlertReceivedOn" TIMESTAMP WITH TIME ZONE,
                ADD COLUMN "dashboardObservationReceivedOn" TIMESTAMP WITH TIME ZONE;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column dashboardAlertReceivedOn already exists in alerts.';
        END;
    END;
$$



