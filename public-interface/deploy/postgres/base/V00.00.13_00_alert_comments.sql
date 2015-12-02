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

CREATE TABLE IF NOT EXISTS "dashboard"."alert_comments" (
    "id" SERIAL PRIMARY KEY,
    "alertId" UUID NOT NULL REFERENCES "dashboard"."alerts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "text" TEXT NOT NULL,
    "user" VARCHAR(255),
    "created" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updated" TIMESTAMP WITH TIME ZONE NOT NULL
);

DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'alert_comments_alertId')
  THEN
    CREATE INDEX "alert_comments_alertId" ON "dashboard"."alert_comments" ("alertId");
    RAISE NOTICE 'alert_comments_alertId index created';
END IF;
END;$$
