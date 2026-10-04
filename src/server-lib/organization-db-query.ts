import { organizationDbClient } from "./organization-db";

type SqlPrimitive = string | number | boolean | Date | null;
type SqlParam = SqlPrimitive | SqlPrimitive[] | Record<string, unknown>;

/**
 * Query a shared organization Postgres database via the Vybe API.
 * @param databaseName - The name of the organization database to query
 * @param sql - The SQL query to execute, using $1, $2, etc. for parameters
 * @param params - The parameters to pass to the query (primitives, arrays for ANY clauses, or objects for JSONB)
 * @returns The result rows from the query
 * @example
 * const result = await queryOrganizationDatabase(
 *   "analytics",
 *   "SELECT * FROM events WHERE user_id = $1",
 *   ["user_123"]
 * );
 * // result = [ { id: "evt_123", user_id: "user_123", created_at: "2026-06-07T12:00:00.000Z" }, ... ]
 */
export async function queryOrganizationDatabase(databaseName: string, sql: string, params: SqlParam[] = []) {
  const response = await organizationDbClient.post<Record<string, unknown>[]>("/query", { databaseName, sql, params });
  return response.data;
}

/**
 * Query a shared organization Postgres database by id via the Vybe API.
 * Prefer queryOrganizationDatabase by name unless the app already has a stable database id.
 */
export async function queryOrganizationDatabaseById(databaseId: string, sql: string, params: SqlParam[] = []) {
  const response = await organizationDbClient.post<Record<string, unknown>[]>("/query", { databaseId, sql, params });
  return response.data;
}
