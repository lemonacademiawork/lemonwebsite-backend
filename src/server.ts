import "dotenv/config";
import app from "./app";
import { prisma } from "./config/database";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Keep Neon PostgreSQL awake: ping every 4 minutes (Neon auto-suspends after 5 minutes of inactivity)
    const PING_INTERVAL_MS = 4 * 60 * 1000;
    const keepAliveTimer = setInterval(async () => {
        try {
            await prisma.$queryRawUnsafe("SELECT 1");
        } catch (error) {
            console.warn("DB keep-alive ping notice:", error instanceof Error ? error.message : error);
        }
    }, PING_INTERVAL_MS);

    // Clean up timer on shutdown
    const shutdown = async () => {
        clearInterval(keepAliveTimer);
        await prisma.$disconnect().catch(() => {});
        server.close(() => {
            process.exit(0);
        });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
});