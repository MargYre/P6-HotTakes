
//authentifier les utilisateurs, garantir que les requêtes sont autorisées.
const express = require('express');
const mongoose = require('mongoose');// bibliothèque pour MongoDB 
const path = require('path'); //module Node.js
const helmet = require('helmet');

require('dotenv').config();

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const app = express();
app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
const mongodburi = process.env.MONGO_URI;
mongoose.connect(mongodburi,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());//analyse les corps des requêtes

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
module.exports = app;