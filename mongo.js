const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('give password as argument');
    process.exit(1);
}

const url = process.env.MONGODB_URI;
mongoose.set('strictQuery', false);

mongoose.connect(url);

const phoneSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Phone = mongoose.model('Phone', phoneSchema);

const phone = new Phone({
    name: process.argv[3],
    number: process.argv[4],
});

phone.save().then(() => {
    console.log(`added ${phone.name} number ${phone.number} to phonebook`);
});

console.log('phonebook:');
Phone.find({}).then(result => {
    result.forEach(phone => {
        console.log(phone.name, phone.number);
    });
    mongoose.connection.close();
});