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

--alter column type 'parameters' in 'commands' table
CREATE OR REPLACE FUNCTION dashboard.alter_commands()
  RETURNS VOID
AS $$
DECLARE columnType "dashboard"."commands"."parameters"%TYPE;
BEGIN
  ALTER TABLE "dashboard"."commands"
  ALTER COLUMN "parameters" TYPE JSON USING parameters :: JSON;

  EXCEPTION
  WHEN OTHERS THEN RAISE NOTICE 'Column cannot be changed';

END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = postgres, pg_temp;

--update unnecessary and wrong records (only for old type of column 'parameters')
CREATE OR REPLACE FUNCTION dashboard.update_commands()
  RETURNS VOID
AS $$
DECLARE columnType TEXT;
        res        NUMERIC;
BEGIN

  SELECT data_type
  INTO columnType
  FROM "information_schema"."columns"
  WHERE table_name = 'commands' AND column_name = 'parameters';

  IF upper(columnType) = 'TEXT'
  THEN
    DELETE FROM "dashboard"."complexCommands"
    WHERE id IN (
      SELECT "complexCommandId"
      FROM "dashboard"."commands"
      WHERE "parameters" = '{"[object Object]"}'
    );

    DELETE FROM "dashboard"."commands"
    WHERE "parameters" = '{"[object Object]"}';

    SELECT *
    FROM dashboard.alter_commands();

  END IF;

END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = postgres, pg_temp;

SELECT *
FROM dashboard.update_commands();
