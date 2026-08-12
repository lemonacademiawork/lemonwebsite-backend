import express from "express";
import authRoutes from "./routes/auth.routes";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./routes/user.routes";
const app = express();

app.use(express.json());

// Swagger Documentation
setupSwagger(app);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

export default app;