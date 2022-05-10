const express = require('express')
const fs = require('fs')
const { Router } = express

const app = express()
const routerCarrito = Router()
const routerProductos = Router()
const PORT = process.env.PORT || 8080;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const acceso = true

async function pedirArchivos(req, res, next){    
    try {
      const contenido = await fs.promises.readFile(`./productos.txt`, "utf-8")
      const datos = JSON.parse(contenido)
      req.datos = datos
    } catch (err) {
      console.log(err);
    }
next()
}

function filtrar(req,res,next) {
    const datos = req.datos    
    const producto = datos.find(prod => prod.id == req.params.id)
    if (!producto) {
        req.filtrado = { error : 'producto no encontrado' }
    }else
        req.filtrado = producto
    next()
}

async function agregar(req,res,next){
    try{
        const contenido = req.datos        
        const time = new Date()        
        let indice = contenido.length > 0 ? contenido[contenido.length-1].id+1 : 1
        let object = req.body        
        if( !object.title || !object.price || !object.description || !object.image || !object.count || !object.codigo){
            res.send({"message" : "faltan datos"})
            return;
        }
        object = {...object, id : indice, timestamp : time}
        req.agregado = object
        contenido.push(object)
        
        try{
            await fs.promises.writeFile(`./productos.txt`, JSON.stringify(contenido))
            next()
        }
        catch(err){
            console.log(`Error al escribir: ${err}`);
        }
    }
    catch(err){            
        console.log(`Error al agregar: ${err}`);        
    }
}

async function modificar(req,res,next) {
    const datos = req.datos    
    let indexProducto = datos.findIndex(x => x.id == req.params.id);    
    if (!datos[indexProducto]) {
        res.end("No se encuntra producto")
    }else{
        const cambio = Object.assign(datos[indexProducto], req.body);
        datos[indexProducto]= cambio
        await fs.promises.writeFile(`./productos.txt`, JSON.stringify(datos))
        next()
    }
}

async function deleteById(req,res,next){

    const contenido = req.datos
    const indice = contenido.findIndex(x => x.id == req.params.id)
    if (indice >= 0) {
        contenido.splice(indice,1)
        try {
            await fs.promises.writeFile(`./productos.txt`, JSON.stringify(contenido))        
            
        } catch (err) {
            console.log("error al escribir" + err);
        }
    }else
     res.end("No se encuentra el articulo")
    next()
}

async function leerCarrito(req,res,next) {
    try {
        const contenido = await fs.promises.readFile(`./carrito.txt`, "utf-8")
        const datos = JSON.parse(contenido)
        req.carrito = datos

        next()
    }catch(err){
        console.log(`error al leer ${carrito}`);
    }
}

async function crearCarrito(req,res,next) {
    const datos = req.carrito
    let indice = datos.length > 0 ? datos[datos.length-1].id+1 : 1
    let fecha = new Date()
    let carrito = {id : indice, timestamp: fecha, productos : []}
    datos.push(carrito)
    req.id = indice
    
    try {
        await fs.promises.writeFile(`./carrito.txt`, JSON.stringify(datos))
        
        next()
    } catch (error) {
        console.log(`error al escribir ${error}`);
    }    
}

async function borrarCarrito(req,res,next){
    const datos = req.carrito
    const indice = datos.findIndex(x => x.id == req.params.id)
    if (indice >= 0) {
        datos.splice(indice,1)
        try {
            await fs.promises.writeFile(`./carrito.txt`, JSON.stringify(datos))        
            
        } catch (err) {
            console.log("error al escribir" + err);
        }
    }else
     res.end("No se encuentra el articulo")
    next()
}

async function filtrarCarrito(req,res,next) {
    const datos = req.carrito    
    const carrito = datos.find(prod => prod.id == req.params.id)
    if (!carrito) {
        req.carritoFiltrado = { "error" : `carrito no encontrado` }
    }else
        req.carritoFiltrado = carrito
    next()
}

async function añadirAlCarrito(req,res,next){    
    const datos = req.carrito
    const productos = req.datos
    if (!req.body.id) {
        res.send({"message":"Ingrese el id del producto"})
        return
    }
    const indice = datos.findIndex(x => x.id == req.params.id)
    if (indice >= 0){
        const producto = productos.find(e => e.id == req.body.id)
        if (!producto) {
            res.send({"message":"productos no existen"})
            return
        }
        
        datos[indice].productos.push(producto)
        try {
            await fs.promises.writeFile(`./carrito.txt`, JSON.stringify(datos))
        } catch (error) {
            console.log(error);
        }
    }else{
        res.end("Carrito no encontrado")
    }
    next()
}

async function eliminarProducto(req,res,next){
    const carrito = req.carrito
    const indice = carrito.findIndex(x => x.id == req.params.id)    
    if (indice >= 0) {
        const productosEnCarrito = carrito[indice].productos        
        const indiceProd = productosEnCarrito.findIndex(x => x.id == req.params.id_prod)
        if  (indiceProd >= 0){            
            carrito[indice].productos.splice(indiceProd,1)
            try {
                await fs.promises.writeFile(`./carrito.txt`, JSON.stringify(carrito))
            } catch (err) {
                console.log("error al escribir" + err);
            }
        }else{
         res.send({"mensaje":"No se encuentra producto"})
         return
        }

            

    }else{
        res.send({"mensaje":"No se encuentra carrito"})
        return
    }
    next()
}

const login = (req,res,next) => { 
    acceso ? next() : 
    res.send({ "error" : -1, "descripcion": "ruta o método no autorizado" }) 
    
}



routerCarrito.post("/", leerCarrito, crearCarrito, (req, res) =>{
    const respuesta = {
        id : req.id
    }
    res.send(JSON.stringify(respuesta))
    //res.end(` El id es:${req.id}`)
})

routerCarrito.delete("/:id", leerCarrito, borrarCarrito, (req,res)=>{
    res.send("Carrito eliminado")
})

routerCarrito.get("/:id/productos", leerCarrito, filtrarCarrito, (req,res)=>{
    res.send(req.carritoFiltrado.productos)
})

routerCarrito.post("/:id/productos", pedirArchivos, leerCarrito, añadirAlCarrito, (req,res)=>{
    res.send("producto añadido")
})

routerCarrito.delete('/:id/productos/:id_prod',leerCarrito, eliminarProducto, (req, res) =>{
    res.send({"mensaje":"producto eliminado con exito"})
})




routerProductos.get('/', pedirArchivos, (req, res) => {
    res.send(req.datos)    
})

routerProductos.get('/:id', pedirArchivos, filtrar, (req, res) => {
    res.send(req.filtrado)    
})

routerProductos.post('/', login, pedirArchivos, agregar,(req, res) => {
    res.send(req.agregado)
})

routerProductos.put('/:id', login, pedirArchivos, modificar, (req, res) => {
    res.send("Articulo actualizado")    
})

routerProductos.delete('/:id', login, pedirArchivos, deleteById,(req,res) =>{
    res.send("Articulo eliminado")
})



app.use('/', express.static('public'));

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)

const server = app.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
 })
server.on("error", error => console.log(`Error en servidor ${error}`))