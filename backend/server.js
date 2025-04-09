const path = require('path')
const express = require('express')
const sql = require('mssql')
const { error } = require('console')

const app = express()
const PORT = 3000

const viewsPath = path.join(__dirname, "../views");
const frontPath = path.join(__dirname, "../frontend")

app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(path.join(__dirname, '../frontend')));

let config = {
    user: 'katya',
    password: 'CampingDB22',
    server: 'KOMPUTER',
    database: 'Camping',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

sql.connect(config, error => {
    if(error) {
        throw error;
    }
    console.log('Connection Successful!');
});

// app.get('/', (req, res) => {
//     new sql.Request().query("SELECT * FROM Clients", (error, result) => {
//         if (error) {
//             console.log("Error executing query", error);
//         } else {
//             res.send(result.recordset);
//         }
//     })
// })

app.get('', (req, res) => {
    res.sendFile('main.html', { root: frontPath + '/pages' })
})

app.get('/client', (req, res) => {
    res.sendFile('client-page.html', {root: frontPath + '/pages'})
})

app.get('/admin', (req, res) => {
    res.sendFile('admin-page.html', {root: frontPath + '/pages'})
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})