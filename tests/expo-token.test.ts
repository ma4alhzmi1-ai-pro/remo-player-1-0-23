import { describe, expect, it } from "vitest";

const withExpoToken = process.env.EXPO_TOKEN ? it : it.skip;

describe("Expo access token", () => {
  withExpoToken(
    "can access the Expo account identity endpoint",
    async () => {
      const token = process.env.EXPO_TOKEN;
      expect(token).toBeTruthy();

      const response = await fetch("https://api.expo.dev/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "query CurrentUser { meActor { id } }",
        }),
      });

      expect(response.ok).toBe(true);
      const payload = (await response.json()) as {
        data?: { meActor?: { id?: string } };
      };
      expect(payload.data?.meActor?.id).toBeTruthy();
    },
    20_000,
  );
});
