const runtimeEnv =
  typeof process !== "undefined" && process.env ? process.env : ({} as Record<string, string | undefined>);

/**
 * Base URL seluruh request API.
 * Kosongkan bila frontend dan backend berada di origin yang sama.
 */
export const API_BASE_URL = String(runtimeEnv.REACT_APP_API_BASE_URL ?? "").replace(/\/+$/, "");
