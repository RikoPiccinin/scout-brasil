
const mongoose = require("mongoose")

const jogadorSchema = new mongoose.Schema({

nome:String,
idade:Number,
posicao:String,
time: String,

velocidade:Number,
passe:Number,
finalizacao:Number,
drible: Number,
defesa: Number,
fisico: Number,

foto: String

})

module.exports = mongoose.model("Jogador", jogadorSchema)
