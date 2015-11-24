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
CREATE OR REPLACE FUNCTION dashboard.add_support_for_export_data()
    RETURNS void
    AS $$
    BEGIN
        BEGIN
            ALTER TABLE "dashboard"."device_components"
                ADD COLUMN "last_observation_time" TIMESTAMP WITH TIME ZONE DEFAULT to_timestamp(0),
                ADD COLUMN "last_export_date" TIMESTAMP WITH TIME ZONE DEFAULT to_timestamp(0);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column last_observation_time already exists in table device_components.';
        END;
    END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = postgres, pg_temp;

SELECT * FROM dashboard.add_support_for_export_data();

CREATE TABLE IF NOT EXISTS "dashboard"."device_component_missing_export_days" (
    "componentId" VARCHAR(255) REFERENCES "dashboard"."device_components" ("componentId") ON DELETE CASCADE ON UPDATE CASCADE,
    "day" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("componentId", "day")
);
