import { describe, expect, it } from "vitest";

import { APP_LANGUAGE_OPTIONS } from "../lib/language-provider";

describe("language options", () => {
  it("offers Arabic plus four additional interface languages", () => {
    expect(APP_LANGUAGE_OPTIONS.map((option) => option.id)).toEqual(["ar", "en", "fr", "tr", "es"]);
  });
});
