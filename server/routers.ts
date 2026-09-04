import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { translateVideoWithAi } from "./video-translation";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  media: router({
    translateVideo: publicProcedure
      .input(z.object({
        videoBase64: z.string().min(4).max(8_500_000),
        targetLanguage: z.enum(["العربية", "English", "Français", "Español", "Türkçe"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const videoBuffer = Buffer.from(input.videoBase64, "base64");
        const host = ctx.req.get("host");
        if (!host) throw new Error("تعذر تحديد عنوان خدمة الترجمة.");
        const protocol = ctx.req.header("x-forwarded-proto") || ctx.req.protocol || "https";
        return translateVideoWithAi({
          videoBuffer,
          targetLanguage: input.targetLanguage,
          requestOrigin: `${protocol}://${host}`,
        });
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
