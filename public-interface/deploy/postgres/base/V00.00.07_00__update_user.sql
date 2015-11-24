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

CREATE OR REPLACE FUNCTION dashboard.update_user(user_id uuid,
                                                user_email varchar(255),
                                                user_password varchar(255),
                                                user_salt varchar(255),
                                                user_terms boolean,
                                                user_verified boolean,
                                                user_provider varchar(255),
                                                attributes json,
                                                account_id varchar(255),
                                                user_acc_role varchar(255))
    RETURNS TABLE (id uuid,
                    email varchar(255),
                    password varchar(255),
                    salt varchar(255),
                    "termsAndConditions" boolean,
                    verified boolean,
                    provider varchar(255),
                    attrs json,
                    created timestamp with time zone,
                    updated timestamp with time zone,
                    role "dashboard"."enum_user_accounts_role",
                    "accountId" uuid)
    AS $$
    DECLARE
        current_acc_role "dashboard"."enum_user_accounts_role";
        user_id_uuid uuid;
    BEGIN
        --Update user
        user_id_uuid := user_id::uuid;

        IF user_id_uuid IS NULL
            THEN
                SELECT u.id INTO user_id_uuid FROM "dashboard"."users" u WHERE u."email" = user_email;
            END IF;

        UPDATE "dashboard"."users" u
            SET
                "password" = COALESCE(user_password, u."password"),
                "salt" = COALESCE(user_salt, u."salt"),
                "termsAndConditions" = COALESCE(user_terms, u."termsAndConditions"),
                "verified" = COALESCE(user_verified, u."verified"),
                "provider" = COALESCE(user_provider, u."provider"),
                "attrs" = COALESCE(attributes, u."attrs"),
                "updated"= now()
        WHERE u."id" = user_id_uuid;

        --Update user account
        IF account_id IS NOT NULL AND user_acc_role IS NOT NULL
        THEN
            --check id account priviliegies are not reduced

            SELECT ua.role INTO current_acc_role FROM "dashboard"."user_accounts" ua
                WHERE ua."userId" = user_id_uuid AND ua."accountId" = account_id::uuid;

            IF current_acc_role::varchar = 'admin' AND user_acc_role <> 'admin'
            THEN
                RAISE EXCEPTION 'CannotReduceAdminPrivileges';
            END IF;

            
            UPDATE "dashboard"."user_accounts" ua
                SET "role" = user_acc_role::"dashboard"."enum_user_accounts_role"
                WHERE ua."userId" = user_id_uuid AND ua."accountId" = account_id::uuid;
            IF NOT FOUND THEN
                INSERT INTO "dashboard"."user_accounts" ("userId",
                                                        "accountId",
                                                        "role",
                                                        "created",
                                                        "updated")
                VALUES (user_id_uuid,
                        account_id::uuid,
                        user_acc_role::"dashboard"."enum_user_accounts_role",
                        now(),
                        now());
            END IF;

        END IF;


        --Return user with his accounts
        RETURN QUERY EXECUTE 'SELECT u.id, u.email, u.password, u.salt,
                                     u."termsAndConditions", u.verified,
                                     u.provider, u.attrs, u.created, u.updated,
                                     ua.role, ua."accountId"
                              FROM "dashboard"."users" u left join "dashboard"."user_accounts" ua on u.id = ua."userId"
                              WHERE u.id = ' || quote_literal(user_id_uuid);
    END;
    $$ LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = postgres, pg_temp;
