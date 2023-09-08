const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = 
  `mongodb+srv://maheensaad:Mirha123@cluster0.hk4skbs.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
    // If only the password is provided, display all entries in the phonebook
    Person.find({}).then((persons) => {
      console.log('phonebook:');
      persons.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    });
  } else if (process.argv.length === 5) {
    // If password, name, and number are provided, add an entry to the phonebook
    const name = process.argv[3];
    const number = process.argv[4];
  
    const newPerson = new Person({
      name,
      number,
    });
  
    newPerson.save().then(() => {
      console.log(`added ${name} number ${number} to phonebook`);
      mongoose.connection.close();
    });
  } else {
    console.log('Invalid number of arguments.');
    mongoose.connection.close();
  }