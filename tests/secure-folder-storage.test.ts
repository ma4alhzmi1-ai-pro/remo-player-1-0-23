import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../lib/library-context.tsx", import.meta.url), "utf8");

describe("secure folder physical storage", () => {
  it("uses an app-private vault and removes the original after copying", () => {
    expect(source).toContain('"remo-player-secure"');
    expect(source).toContain("source.copy(destination)");
    expect(source).toContain("source.delete()");
    expect(source).toContain("copyToCacheDirectory: false");
  });

  it("does not register a failed vault copy as a secure item", () => {
    expect(source).toContain("if (!persistentUri) return null;");
  });
});
