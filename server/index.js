const express = require('express');
const path = require('path');
const axios = require('axios');
const { saveInteraction } = require('./db');

const app = express();
const port = 3006;

// Reemplaza estos valores con tu propia clave API y CX
const GOOGLE_API_KEY = 'AIzaSyAKKP9cSwTh6autHy4D427hCtdrmb5vhcE';
const GOOGLE_CX = '631f8d8602c234d92'; // CX debe ser el ID del motor de búsqueda, no la URL

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let opened = false; // Bandera para controlar la apertura del navegador

app.post('/api/ask', async (req, res) => {
    const { question } = req.body;
    let answer = '';
    let url = null;

    if (question.includes('hora')) {
        answer = `La hora actual es ${new Date().toLocaleTimeString()}`;
    } else if (question.includes('nombre')) {
        answer = 'Mi nombre es Wobby. ¿Cuál es el tuyo?';
    } else if (question.includes('chiste')) {
        answer = '¿Por qué los programadores odian la naturaleza? Porque tiene demasiados bugs.';
    } else if (question.includes('youtube')) {
        answer = 'Te abriré YouTube para tu búsqueda.';
        const searchTerm = question.replace('youtube', '').trim();
        url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;

        if (!opened) {
            opened = true;
            try {
                const open = (await import('open')).default;
                open(url);
                setTimeout(() => opened = false, 3000); // Restablecer la bandera después de un tiempo
            } catch (err) {
                console.error('Error al abrir YouTube:', err);
                opened = false;
            }
        }
    } else if (question.includes('buscar')) {
        const searchTerm = question.replace('buscar', '').trim();
        try {
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: GOOGLE_API_KEY,
                    cx: GOOGLE_CX,
                    q: searchTerm,
                },
            });
            const items = response.data.items;
            if (items && items.length > 0) {
                answer = `Aquí están los resultados de búsqueda para "${searchTerm}":`;
                url = items[0].link;  // Proporciona el primer resultado
            } else {
                answer = 'No se encontraron resultados para tu búsqueda.';
            }
        } catch (error) {
            console.error('Error al buscar en Google:', error);
            answer = 'Hubo un error al buscar en Google.';
        }
    } else {
        answer = 'Lo siento, no entiendo la pregunta.';
    }

    saveInteraction(question, answer);
    res.json({ answer, url });
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
