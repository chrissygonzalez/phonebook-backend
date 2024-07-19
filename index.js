require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

morgan.token('body', function getBody(req) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
})

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('dist'))

let data = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get('/api/persons', (request, response) => {
    response.json(data)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const entry = data.find(entry => entry.id == id);

    if (entry) {
        response.json(entry)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    data = data.filter(entry => entry.id !== id);

    response.status(204).end();
})

app.post('/api/persons', (request, response) => {
    const body = request.body;
    // console.log(body);

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    if (data.find(entry => entry.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const entry = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 10000),
    }

    data = data.concat(entry);
    // console.log(data);
    response.json(entry);
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${data.length} people</p><p>${new Date()}</p>`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT;
console.log(process.env.PORT);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})