import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve("public/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
