import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { resetTestState } from "./handlers";
import { server } from "./server";

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => "test-toast-id",
  },
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  resetTestState();
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());
