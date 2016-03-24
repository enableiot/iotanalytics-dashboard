-----------------------------------------------------------------------------
--  Copyright (c) 2016 Intel Corporation
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
            ALTER TABLE "dashboard"."rules"
                ADD COLUMN "synchronizationStatus" "dashboard"."enum_sync_status" DEFAULT 'NotSync';
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column synchronizationStatus already exists in rules.';
        END;

        IF NOT EXISTS (
            SELECT 1 FROM pg_class WHERE relname = 'rules_status_index')
        THEN
        EXECUTE 'CREATE INDEX rules_status_index ON "dashboard"."rules" USING BTREE ("status", "synchronizationStatus")';
            RAISE NOTICE 'Index - rules_status_index created';
        ELSE
            RAISE NOTICE 'Index - rules_status_index already exists';
        END IF;
    END;
$$



