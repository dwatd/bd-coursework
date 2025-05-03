const path = require("path");
const express = require("express");
const { connectToDb } = require("./db");
const tariffsRouter = require("./routes/tariffs");
const expensesRouter = require("./routes/expenses");
const bookingsRouter = require("./routes/bookings");
const clientsRouter = require("./routes/clients");
const accommodationRouter = require("./routes/accommodation");
const storageRouter = require("./routes/storage");
const incomeRouter = require("./routes/income");

const app = express();
const PORT = 3000;

const viewsPath = path.join(__dirname, "../views");
const frontPath = path.join(__dirname, "../frontend");

app.set("view engine", "ejs");
app.set("views", viewsPath);
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

connectToDb();

app.use("/api/tariffs", tariffsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/accommodation", accommodationRouter);
app.use("/api/storage", storageRouter);
app.use("/api/income", incomeRouter);

app.get('', (req, res) => {
  res.sendFile('cw-page.html', {root: frontPath + '/pages' })
})

app.get("/main", (req, res) => {
  res.sendFile("main.html", { root: frontPath + "/pages" });
});

app.get("/client", (req, res) => {
  res.sendFile("client-page.html", { root: frontPath + "/pages" });
});

app.get("/admin", (req, res) => {
  res.sendFile("admin-page.html", { root: frontPath + "/pages" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
