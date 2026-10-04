import { integrationsClient } from "@/client-lib/shared";

export const MAX_CUSTOM_API_UPLOAD_BYTES = 4_300_000;

type MultipartPart = { name: string; value: string | Blob; filename?: string };

type ExecuteCustomApiParams =
  | {
      method?: string;
      path?: string;
      headers?: Record<string, string>;
      body?: Record<string, unknown> | unknown[];
      parts?: never;
    }
  | {
      method?: "POST" | "PUT" | "PATCH";
      path?: string;
      headers?: Record<string, string>;
      body?: never;
      parts: MultipartPart[];
    };

function partSize(part: MultipartPart): number {
  return typeof part.value === "string" ? new Blob([part.value]).size : part.value.size;
}

/**
 * Call a Custom API through the Vybe proxy. Can only be used client-side.
 * @param id - The id of the Custom API to call.
 * @param params.method - HTTP method (default: GET)
 * @param params.path - Path to append to the configured domain
 * @param params.headers - Extra headers to include in the request
 * @param params.body - Request body (JSON) — mutually exclusive with parts
 * @param params.parts - Multipart form parts for file uploads — mutually exclusive with body
 * @returns The response from the external API
 */
export async function callCustomApi<ResponseType>(id: string, params: ExecuteCustomApiParams): Promise<ResponseType> {
  if (!params.parts) {
    return integrationsClient.post<ResponseType>(`/custom-apis/${id}/execute`, params).then((res) => res.data);
  }

  if (params.body !== undefined) {
    throw new Error("body and parts are mutually exclusive — use parts for multipart uploads");
  }

  const totalBytes = params.parts.reduce((sum, part) => sum + partSize(part), 0);
  if (totalBytes > MAX_CUSTOM_API_UPLOAD_BYTES) {
    throw new Error(
      `Upload is ${totalBytes} bytes, which exceeds the ${MAX_CUSTOM_API_UPLOAD_BYTES} byte limit — use smaller files`,
    );
  }

  const formData = new FormData();
  formData.append("params", JSON.stringify({ method: params.method, path: params.path, headers: params.headers }));
  for (const part of params.parts) {
    if (typeof part.value !== "string" && part.filename !== undefined) {
      formData.append(part.name, part.value, part.filename);
    } else {
      formData.append(part.name, part.value);
    }
  }

  return integrationsClient.post<ResponseType>(`/custom-apis/${id}/execute`, formData).then((res) => res.data);
}
