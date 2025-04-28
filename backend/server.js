const path = require('path');
const express = require('express');
const { connectToDb } = require('./db'); 
const tariffsRouter = require('./routes/tariffs'); 

const app = express();
const PORT = 3000;

const viewsPath = path.join(__dirname, "../views");
const frontPath = path.join(__dirname, "../frontend");

app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

connectToDb();

app.use('/api/tariffs', tariffsRouter);

app.get('', (req, res) => {
    res.sendFile('main.html', { root: frontPath + '/pages' });
});

app.get('/client', (req, res) => {
    res.sendFile('client-page.html', { root: frontPath + '/pages' });
});

app.get('/admin', (req, res) => {
    res.sendFile('admin-page.html', { root: frontPath + '/pages' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
