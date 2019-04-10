require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session =require('express-session');
const jwt = require('jsonwebtoken');


if(typeof localStorage === "undefined" || localStorage === null){
    let LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch')
}

const dirPublic = path.join(__dirname, '../public');
const dirNode_modules = path.join(__dirname, '../node_modules');

app.use(express.static(dirPublic));
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));


/* app.use(session({
    secret: 'keyboard cat',
    resave : false,
    saveUninitialized : true
})); */

app.use((req, res, next) => {
/*     console.log('req.session.usuario: ' + req.session.nombre);
    if(req.session.usuario){
        res.locals.session = true;
        res.locals.nombre = req.session.nombre;
    } 
*/
    let token = localStorage.getItem('token');

    jwt.verify(token, 'tdea-virtual',(err, decode) => {

        if(err){
            return next(); 
        } else {

            res.locals.session = true;
            res.locals.nombre = decode.data.nombre;
            req.usuario = decode.data._id;
        }   

        return next();    
    });
});
app.use(bodyParser.urlencoded({extended : true}));

app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, {useNewUrlParser : true}), (err, result) => {
    if(err){
        return console.log(err);
    }

    let database = result.database('asignaturas');
    let collection = database.collection('estudiantes');
    console.log('conectado');
};

app.listen(process.env.PORT, () => {
    console.log('servidor por el puerto ' + process.env.PORT);
})