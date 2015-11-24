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

--Temporary function remove before release stable/major version
CREATE OR REPLACE FUNCTION dashboard.drop_old_activate_device()
    RETURNS void
    AS $$
    BEGIN
        BEGIN
            DROP FUNCTION dashboard.activate_device(varchar(255), varchar(8), varchar(255), varchar(255));
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'already removed';
        END;
    END;
    $$ LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = postgres, pg_temp;

    SELECT * FROM dashboard.drop_old_activate_device();

CREATE OR REPLACE FUNCTION dashboard.activate_device(account_activation_code varchar(8), device_id varchar(255), device_status varchar(255))
    RETURNS RECORD
    AS $$
    DECLARE device_account_id uuid;
            account_activation_code_expire_date timestamp with time zone;
            result RECORD;
    BEGIN

        SELECT account.id, account.activation_code_expire_date INTO device_account_id, account_activation_code_expire_date
            FROM "dashboard"."accounts" account
            WHERE account.activation_code = account_activation_code;

        IF device_account_id IS NULL OR account_activation_code_expire_date < current_timestamp
            THEN
                RAISE EXCEPTION 'InvalidActivationCode';
        END IF;

        UPDATE "dashboard"."devices"
            SET status = device_status::"dashboard"."enum_devices_status"
            WHERE "id" = device_id AND "accountId" = device_account_id;

        SELECT FOUND, device_account_id INTO result;
        RETURN result;
    END;
    $$ LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = postgres, pg_temp;
