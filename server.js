const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const handlebars = require("express-handlebars")
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const mongoose = require("mongoose")
const normalizr = require("normalizr")
const normalize = normalizr.normalize
const schema = normalizr.schema

const { faker } = require('@faker-js/faker');
faker.locale = 'es';

const PORT = process.env.PORT || 8080

const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const mongoDatos = {
    URL : "mongodb://localhost:27017/mensajes",
    option: {
        useNewUrlParser: true,
        useUnifiedTopology : true
    }
}


const schemamongo = new mongoose.Schema({
    author:{
        mail: {type: String, require:true},
        nombre : {type: String, require:true},
        apellido : {type: String, require:true},
        edad:{type: Number, require:true},
        alias:{type: String, require:true},
        avatar:{type: String, require:true}
    },
    fyh:{type: String, require:true},
    text:{type: String, require:true}
})

class chat{
    constructor(){        
        this.modelo = mongoose.model("chats", schemamongo)
    }

    async pedirDatos(){
        await mongoose.connect(mongoDatos.URL, mongoDatos.option)
        const resp = await this.modelo.find()         
        
        
        const users = new schema.Entity('author')

        
        const text = new schema.Entity('text', {
            author: users
        })

        const normalizados = normalize(
            { id: 'mensajes', messages: resp },
            text
        );        

        return normalizados        
    }
 
    async guardarChat(datos){        
        await mongoose.connect(mongoDatos.URL, mongoDatos.option)
        const nuevoProd = new this.modelo(datos)
        let doc = await nuevoProd.save();
        
    }
}

const chats = new chat()

const productosAleatorios = () => {
    let productosAzar = []
    for (let i = 1; i < 6; i++) {
        productosAzar.push({
            id: i,
            title: faker.commerce.productName(),
            price: faker.commerce.price(),
            thumbnail: faker.image.food(256, 256, true)
        })
    }
    return productosAzar
}



const MongoStore = connectMongo.create({
    mongoUrl: 'mongodb+srv://admin:admin@cluster0.z2crk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    ttl: 60
})



app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("./public"));

app.use(cookieParser());
app.use(session({
    store: MongoStore,
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{        
        maxAge: 60000
    }
}));

app.engine("hbs", 
    handlebars.engine({
    extname:".hbs", 
    defaultLayout: "index.hbs"
    })
)

app.set('view engine', 'hbs')
app.set('views', './views')

app.get("/api/productos-test", (req, res) => {    
    const resp = productosAleatorios()
    res.send(resp)
});

app.get('/login', (req,res) => {
    if (!req.session.usuario) {
        res.render("login")
    }else{
        req.session.contador++;
        res.render("usuario", {usuario : req.session.usuario, contador: req.session.contador})    
    }
})

app.post('/login', (req,res) => {    
    req.session.contador = 0;
    req.session.usuario = req.body.nombre
    res.redirect("/login")
})


app.get('/logout', (req,res) => {
    let usuario = req.session.usuario
    req.session.destroy()
    res.render("logout", {usuario : usuario})    
})


io.on("connection", (socket) => {
    console.log("Usuario conectado");

    chats.pedirDatos()
        .then(resp => io.sockets.emit("mensajes", resp))


    socket.on("envio", (data) => {
        async function asyncCallChat(data) {
            await chats.guardarChat(data);
            chats.pedirDatos().then(resp => io.sockets.emit("mensajes", resp))                
            
        }
        
        asyncCallChat(data)
    });


})

httpServer.listen(PORT, () => console.log("SERVER ON"));
