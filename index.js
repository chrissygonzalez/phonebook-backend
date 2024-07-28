require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Phone = require('./models/phones');

morgan.token('body', function getBody(req) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
});

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());

app.get('/api/persons', (request, response, next) => {
    Phone.find({}).then(result => {
        response.json(result);
    }).catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
    Phone.findById(request.params.id).then(phone => {
        if (phone) {
            response.json(phone);
        } else {
            response.status(404).end();
        }
    }).catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;
    Phone.findByIdAndUpdate(request.params.id, { name: body.name, number: body.number }, { new: true, runValidators: true, context: 'query' })
        .then(savedPhone => {
            response.json(savedPhone);
        }).catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Phone.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if (body.name === undefined || body.number === undefined) {
        return response.status(400).json({ error: 'content missing' });
    }

    const phone = new Phone({
        name: body.name,
        number: body.number,
    });

    phone.save().then(savedPhone => {
        response.json(savedPhone);
    }).catch(error => next(error));
});

app.get('/info', (request, response) => {
    Phone.find({}).then(result => {
        response.send(`<p>Phonebook has info for ${result.length} people</p><p>${new Date()}</p>`);
    });
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});