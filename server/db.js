const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'asistente_virtual'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

function saveInteraction(question, answer) {
    const query = 'INSERT INTO interacciones (pregunta, respuesta) VALUES (?, ?)';
    db.query(query, [question, answer], (err) => {
        if (err) throw err;
        console.log('Interacción guardada en la base de datos');
    });
}

function getSimilarInteraction(question, callback) {
    const query = 'SELECT respuesta FROM interacciones WHERE pregunta LIKE ? LIMIT 1';
    db.query(query, [`%${question}%`], (err, results) => {
        if (err) throw err;
        callback(results.length > 0 ? results[0] : null);
    });
}

module.exports = { saveInteraction, getSimilarInteraction };
