import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { creditoRouter } from "./routes/creditoRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", creditoRouter);
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.listen(PORT, () => {
  console.log(`🚀 credito-ia rodando em http://localhost:${PORT}`);
  console.log(`   Teste o benchmark: GET  http://localhost:${PORT}/api/benchmark`);
  console.log(`   Gere uma análise:  POST http://localhost:${PORT}/api/analise-credito`);
});
