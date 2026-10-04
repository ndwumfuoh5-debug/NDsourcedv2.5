import axios from "axios";
import { vybeRequestInterceptor } from "./vybe-request-interceptor";

interface ExecuteCustomApiParams {
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown[];
}

const vybeDomain =
  process.env.VYBE_SERVER_CALLBACK_URL ?? process.env.NEXT_PUBLIC_VYBE_INTEGRATIONS_DOMAIN ?? "https://vybe.build";

const serverCustomApiClient = axios.create({
  baseURL: vybeDomain + "/api/custom-apis",
});

serverCustomApiClient.interceptors.request.use(vybeRequestInterceptor);

/**
 * Call a Custom API through the Vybe proxy. Can only be used server-side, never client-side.
 * @param id - The id of the Custom API to call.
 * @param params.method - HTTP method (default: GET)
 * @param params.path - Path to append to the configured domain
 * @param params.headers - Extra headers to include in the request
 * @param params.body - Request body (JSON)
 * @returns The response from the external API
 */
export async function callCustomApiFromServer<ResponseType>(
  id: string,
  params: ExecuteCustomApiParams,
): Promise<ResponseType> {
  const response = await serverCustomApiClient.post<ResponseType>(`/${id}/execute`, params);
  return response.data;
}
