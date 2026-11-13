import { ApiError, apiClient, getCsrfToken } from "../apiClient";

const originalFetch = global.fetch;

const createResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  }) as unknown as Response;

afterEach(() => {
  global.fetch = originalFetch;
  document.cookie = "";
});

test("mengirim GET dengan credentials dan mengembalikan body", async () => {
  const fetchMock = jest.fn().mockResolvedValue(createResponse({ ok: true }));
  global.fetch = fetchMock as unknown as typeof fetch;

  const result = await apiClient.get<{ ok: boolean }>("/api/test");

  expect(result).toEqual({ ok: true });
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/api/test"),
    expect.objectContaining({ method: "GET", credentials: "include" }),
  );
});

test("tidak mengirim header CSRF untuk request GET", async () => {
  const fetchMock = jest.fn().mockResolvedValue(createResponse({ ok: true }));
  global.fetch = fetchMock as unknown as typeof fetch;

  await apiClient.get("/api/test");

  const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  const headers = init.headers as Record<string, string>;
  expect(headers["X-CSRF-Token"]).toBeUndefined();
});

test("menyertakan X-CSRF-Token dari meta saat POST", async () => {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "csrf-token");
  meta.setAttribute("content", "token-uji");
  document.head.appendChild(meta);

  const fetchMock = jest.fn().mockResolvedValue(createResponse({ ok: true }));
  global.fetch = fetchMock as unknown as typeof fetch;

  await apiClient.post("/api/pull", { count: 1 });

  const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  const headers = init.headers as Record<string, string>;
  expect(headers["X-CSRF-Token"]).toBe("token-uji");

  document.head.removeChild(meta);
});

test("melempar ApiError dengan pesan aman untuk respons 5xx (sanitasi detail internal)", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue(
      createResponse({ message: "stack trace at /src/app.ts:10 ECONNREFUSED 127.0.0.1:4000" }, 500),
    ) as unknown as typeof fetch;

  await expect(apiClient.get("/api/fail")).rejects.toBeInstanceOf(ApiError);

  global.fetch = jest
    .fn()
    .mockResolvedValue(
      createResponse({ message: "stack trace at /src/app.ts:10 ECONNREFUSED 127.0.0.1:4000" }, 500),
    ) as unknown as typeof fetch;

  await expect(apiClient.get("/api/fail")).rejects.toMatchObject({
    message: expect.stringContaining("bermasalah"),
  });
});

test("melempar ApiError NETWORK_ERROR ketika fetch gagal", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("boom")) as unknown as typeof fetch;

  await expect(apiClient.get("/api/offline")).rejects.toMatchObject({
    code: "NETWORK_ERROR",
    status: 0,
  });
});

test("getCsrfToken membaca cookie double-submit bila meta tidak ada", () => {
  document.cookie = "XSRF-TOKEN=abc123";
  expect(getCsrfToken()).toBe("abc123");
});

test("getCsrfToken mengembalikan null bila tidak ada meta maupun cookie", () => {
  document.cookie = "";
  expect(getCsrfToken()).toBeNull();
});
