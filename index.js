require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person')

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.static('build'));

morgan.token('req-body', (req) => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.get('/info', (req, res) => {
  Person.countDocuments().then(count => {
    const currentDate = new Date();
    const responseText = `<p>Phonebook has info for ${count} people</p> <p>${currentDate}</p>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(responseText);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Person.findById(id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => {
      next(error);
    });
});

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => {
      next(error); // Pass the error to the error handler middleware
    });
})

// ... (previous code)

// Update a phonebook entry by ID
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => {
      next(error);
    });
});


const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'Malformatted id' });
  }

  next(error);
};

app.use(errorHandler);

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name and number are required' });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson.save()
    .then(savedPerson => {
      res.json(savedPerson);
    })
    .catch(error => {
      console.error('Error adding a new person:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});