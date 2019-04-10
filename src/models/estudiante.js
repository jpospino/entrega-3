const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')


const Schema = mongoose.Schema;
const estudianteSchema = new Schema({
    nombre : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },    
    password : {
        type : String,
        required : true
    },
    matematicas : {
        type : Number,
        default : 0,
        min : 0,
        max : [5,'El valor máximo de la nota es 5.']
    },
    ingles : {
        type : Number,
        default : 0,
        min : 0,
        max : 5
    },
    programacion : {
        type : Number,
        default : 0,
        min : 0,
        max: 5
    },
});

estudianteSchema.plugin(uniqueValidator);

const Estudiante = mongoose.model('Estudiante', estudianteSchema);
module.exports = Estudiante;