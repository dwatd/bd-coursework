const path = require('path')
const express = require('express')

const app = express()
const PORT = 3000

const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../views");

app.set('view engine', 'ejs');
app.set('views', viewsPath);


app.get('', (req, res) => {
    res.send("Main page");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})