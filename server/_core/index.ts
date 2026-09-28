import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.get("/api/version", (_req, res) => {
    res.json({
      latestVersion: "1.0.16",
      versionCode: 16,
      releaseDate: "2026-09-16",
      title: "تحديث ريمو كيبورد v1.0.16 متوفر الآن",
      message: "يتوفر إصدار جديد من ريمو كيبورد يحتوي على ميزة الكتابة الفعلية بالخطوط العربية الحقيقية، الكيبورد الناطق لنطق الكلمة كاملة بعد اكتمالها، تحسينات الثيمات وخلفيات الأندية، وإشعارات التحديث التلقائية المباشرة.",
      releaseNotes: [
        "الكتابة الفعلية بالخطوط العربية الحقيقية (القاهرة، الأميري، تجوال، رقعة عارف، المراعي)",
        "الكيبورد الناطق الذكي للكلمات كاملة بعد اكتمالها بنقاء صوتي عالي",
        "تفعيل التحقق من التحديثات أونلاين وإشعارات النظام التلقائية المباشرة",
        "خلفيات حية وثيمات 3D لأندية كرة القدم والتحكم الدقيق بارتفاع الكيبورد"
      ],
      apkUrl: "https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases/download/v1.0.16/RemoKeyboard-1.0.16.apk",
      directDownloadUrl: "/RemoKeyboard-1.0.16.apk",
      zipUrl: "https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases/download/v1.0.16/RemoKeyboard-1.0.16-Android-APK.zip",
      githubReleaseUrl: "https://github.com/ma4alhzmi1-ai-pro/RemoKeyboard-Pro/releases/tag/v1.0.16"
    });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
