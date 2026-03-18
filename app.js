

const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const session = require("express-session")
const multer = require("multer")


const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "public/uploads")
    },

    filename: function (req, file, cb) {

        cb(null, Date.now() + path.extname(file.originalname))

    }

});

const upload = multer({ storage: storage });


const Jogador = require("./models/jogador")

const app = express()

//mongoose.connect("mongodb+srv://rikopiccinin_db_user:Riko27xtz@dash.ur51ogs.mongodb.net/dash")
mongoose.connect("mongodb+srv://rikopiccinin_db_user:Riko27xtz@dash.ur51ogs.mongodb.net/dash")
.then(() => {
    console.log("Mongo conectado");

   
})
.catch(err => {
    console.log("❌ ERRO REAL DO MONGO:");
    console.log(err);
})

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use('/uploads', express.static('public/uploads'))

app.use(session({
    secret: "scoutsecret",
    resave: false,
    saveUninitialized: false
}))


app.get("/", (req, res) => {
    res.render("login")
})



app.get("/obrigado", (req, res) => {
    res.send(`
    <h2>Resposta enviada com sucesso!</h2>
    <br>
    <a href="/login">
        <button>Voltar para Login</button>
    </a>
`
    )
})


function auth(req, res, next) {

    if (req.session.admin) {
        next()
    } else {
        res.redirect("/login")
    }

}

app.get("/admin", auth, async (req, res) => {

const busca = req.query.busca

let jogadores

if(busca){

jogadores = await Jogador.find({
nome: { $regex: busca, $options: "i" }
})

}else{

jogadores = await Jogador.find()

}

//--------------------------------------------------------------

    

    const total = jogadores.length

    let vel = 0, pas = 0, fin = 0

    jogadores.forEach(j => {
        vel += j.velocidade
        pas += j.passe
        fin += j.finalizacao
    })

    const mediaVel = total ? (vel / total).toFixed(2) : 0
    const mediaPas = total ? (pas / total).toFixed(2) : 0
    const mediaFin = total ? (fin / total).toFixed(2) : 0

    const ranking = jogadores
        .map(j => ({
            nome: j.nome,
            score: (j.velocidade + j.passe + j.finalizacao) / 3
        }))
        .sort((a, b) => b.score - a.score)

    res.render("admin/dashboard", {
        jogadores,
        total,
        mediaVel,
        mediaPas,
        mediaFin,
        ranking
    })

})

app.get("/login", (req, res) => {
    res.render('login')
})

app.post("/login", (req, res) => {

    const { usuario, senha } = req.body
    if (usuario === "admin" && senha === "Riko27xtz") {
        req.session.admin = true
        res.redirect("/admin")

    } else {
        res.send(`
    <h2>Login inválido</h2>
    <br>
    <a href="/login">
        <button>Voltar para Login</button>
    </a>
`)

    }

})

app.get("/logout", (req, res) => {

    req.session.destroy()
    res.redirect("/admin")

})


//CADSATRO DE JOGADORES

app.get("/cadastro", (req, res) => {
    res.render("form")
})

app.post("/enviar", upload.single("foto"), async (req, res) => {

   // console.log(req.body);  teste

    const jogador = new Jogador({

        nome: req.body.nome,
        idade: req.body.idade,
        posicao: req.body.posicao,
        time: req.body.time,

        velocidade: req.body.velocidade,
        passe: req.body.passe,
        finalizacao: req.body.finalizacao,
        drible: req.body.drible,
        defesa: req.body.defesa,
        fisico: req.body.fisico,

        foto: req.file ? req.file.filename : null,

        youtube: String 
    });

    await jogador.save();

    res.redirect("/admin");

});

app.get("/jogador/:id", async (req, res) => {

    const jogador = await Jogador.findById(req.params.id);

    res.render("admin/jogador", { jogador });
})

//ROTA PRA EXCLUIR JOGADOR

app.post("/excluir/:id", async (req, res) => {

    await Jogador.findByIdAndDelete(req.params.id)

    res.redirect("/admin")
})

// ROTA PARA EDITAR O JOGAR


app.get("/editar/:id", async (req, res) => {

    const jogador = await Jogador.findById(req.params.id)

    res.render("editar", { jogador })
})

// ROTA PARA ATUALIZAR O JOGADOR

app.post("/editar/:id", upload.single("foto"), async (req, res) => {

const dados = {

nome: req.body.nome,
idade: req.body.idade,
posicao: req.body.posicao,
time: req.body.time,

velocidade: req.body.velocidade,
passe: req.body.passe,
finalizacao: req.body.finalizacao,
drible: req.body.drible,
defesa: req.body.defesa,
fisico: req.body.fisico,
youtube: req.body.youtube

}

if(req.file){
dados.foto = req.file.filename
}

await Jogador.findByIdAndUpdate(req.params.id, dados)

res.redirect("/admin")

})

// RANKING

app.get("/ranking", async (req,res)=>{

const jogadores = await Jogador.find()

jogadores.forEach(j=>{

j.score = (
j.velocidade +
j.passe +
j.finalizacao +
j.drible +
j.defesa +
j.fisico
)/6

})

jogadores.sort((a,b)=> b.score - a.score)

res.render("ranking",{jogadores})

})




// ROTA PARA USAR NO DESKTOP
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000")
})


//ROTA PARA USAR NO RENDER

/*const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
console.log("Servidor rodando")
})*/