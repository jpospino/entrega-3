const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const Estudiante = require('../models/estudiante');
const bcrypt = require('bcrypt');
const session =require('express-session');
const jwt = require('jsonwebtoken');

const dirViews = path.join(__dirname, '../../template/views');
const dirPartials = path.join(__dirname,'../../template/partial');

require('../helpers/helpers');
hbs.registerPartials(dirPartials);
app.set('views', dirViews);
app.set('view engine', 'hbs');

app.get('/', (req, res) => {

    console.log('intentado hacer la conexion');
    
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://elbarto:mtb123456@nodejstdea-wbv9l.mongodb.net/asignaturas?retryWrites=true";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        console.log('se intento conextar ahora');
        console.log('mensaje de error ==>' + err);
        
    const collection = client.db("asignaturas").collection("estudiantes");
    // perform actions on the collection object
        client.close();
        console.log('conexion probada jajajaj');
    
    });
    /*
    return res.render('index', {
        titulo : 'Inicio'
    });
    */
});

app.get('/index', (req, res) => {
    return res.render('index', {
        titulo : 'Inicio'
    });
});

const hash = 10;

app.post('/', (req, res) => {
    let estudiante   = new Estudiante({
        nombre : req.body.nombre,
        password : bcrypt.hashSync(req.body.password, hash),
        matematicas : req.body.matematicas,
        ingles : req.body.ingles,
        programacion : req.body.programacion
    });
    
    console.log('se intenta guardar el estudiante');

    estudiante.save((err, resultado) => {
        if(err){
            return res.render('indexpost',{
                titulo : err
            });
        }

        res.render('indexpost', {
            titulo : 'Se ha creado el estudiante ' + resultado.nombre
        })
    });
});

app.get('/vernotas', (req, res) => {
    Estudiante.find({}).exec((err, respuesta) => {
        if(err){
            return res.render('indexpost', {
                titulo : err
            });
        }
        res.render('vernotas', {
            titulo : 'Ver notas',
            listado : respuesta
        });
    });
});

app.get('/actualizar',(req, res) => {

    console.log('req.usuario: ' + req.usuario);
    
    Estudiante.findById({_id : req.usuario}).exec(
        (err, resultado) => {
            if(err){
                console.log(err);
            }

            if(!resultado){
                return res.redirect('/');
            }

            res.render('actualizar',{
                titulo : 'Actualizar',
                nombre : resultado.nombre,
                matematicas : resultado.matematicas,
                ingles : resultado.ingles,
                programacion : resultado.programacion,
            });
        }
    ); 
});

app.post('/actualizar',(req, res) => { 
    Estudiante.findOneAndUpdate({_id : req.usuario},
        req.body, {new : true, runValidators : true, context : 'query'},(err, resultado) => {        
            if(err){
                return res.render('indexpost', {
                    titulo : err
                });
            } 

            res.render('actualizar',{
                nombre : resultado.nombre,
                matematicas : resultado.matematicas,
                ingles : resultado.ingles,
                programacion : resultado.programacion,
                titulo : 'Notas estudiante actualizadas'
            });
        });


});

app.post('/eliminar',(req, res) => {
    Estudiante.findOneAndDelete({nombre : req.body.nombre},
        req.body, (err, resultado) => {
            if(err){
                return res.render('indexpost', {
                    titulo : err
                });
            }

            res.render('eliminar',{
                titulo : 'Estudiante eliminado',
                nombre : resultado.nombre
            });
        });
});

app.post('/ingresar',(req, res) => {
    Estudiante.findOne({nombre : req.body.usuario}).exec(
         (err, resultado) => {
            if(err){
                return console.log('Usuario no encontrado');
            }

           if(!resultado){
               return res.render('ingresar', {
                   nombre : 'Usuario no encontrado'
               });
           }
           
           if(!bcrypt.compareSync(req.body.password, resultado.password)){
               return res.render('ingresar', {
                   nombre : 'Contraseña no es correcta'
               });
           }

            let token = jwt.sign(
                {
                    data: resultado
                }, 'tdea-virtual',{expiresIn : '1h'});           
            
                localStorage.setItem('token' , token);
            
           res.render('ingresar', {
               mensaje : "Bienvenido " + resultado.nombre,
               titulo : 'Bienvenido'
           });
        }
    );
});

app.post('/salir',(req, res) => {
/* 
    req.session.destroy((err) => {
        if(err)
            console.log("error al cerrar sesión");

        return res.render('/', {
            titulo : 'Inicio'
        });
    }); */

    localStorage.removeItem('token');
    res.redirect('/');
});

app.get('*', (req, res) => {
    res.render('indexpost', {
        titulo : 'Error 404'
    });
});

module.exports = app;