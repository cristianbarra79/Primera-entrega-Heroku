
const verProducto = document.querySelector("#verProductos")
const cargarProductos = document.querySelector("#cargarProductos")
const crearCarrito = document.querySelector("#crearCarrito")
const verCarrito = document.querySelector("#verCarrito")

const contenido = document.querySelector("#contenido")
verCarrito.style.visibility = "hidden";

let carrito_id

verProducto.addEventListener("click", ()=>{
    
    fetch("/api/productos")
    .then(response => response.json())
    .then((json) => {        
        const data = json.map( e => {
            return `<div class="card" style="width: 18rem;">
                <img src="${e.image}" class="card-img-top" alt="">
                <div class="card-body">
                    <h5 class="card-title">${e.title}</h5>
                    <p class="card-text">${e.description}</p>
                    <button onclick="comprar(${e.id})" ${carrito_id ? null : "disabled"} class="btn btn-primary">Comprar</button>
                    <a onclick="actualizar(${e.id})" class="btn btn-primary">Actualizar</a>
                    <a onclick="eliminarProd(${e.id})" class="btn btn-primary">Eliminar</a>
                </div>
            </div>`
        })        
        contenido.innerHTML = data.join("")
    })
})

cargarProductos.addEventListener("click", ()=>{
    contenido.innerHTML = `<form action="/api/productos" method="POST" class="col align-self-center">
        <label for="title">Nombre</label>
        <input name="title" type="text">
        <label for="descripcion">descripcion</label>
        <input name="description" type="text">
        <label for="codigo">código</label>
        <input name="codigo" type="text">
        <label for="image">Imagen</label>
        <input name="image" type="text">
        <label for="price">Precio</label>
        <input name="price" type="text">
        <label for="count">stock</label>
        <input name="count" type="text">        
        <input type="submit" value="Agregar">
    </form>`
})

crearCarrito.addEventListener("click", ()=>{
    verCarrito.style.visibility = "visible";
    crearCarrito.style.visibility = "hidden";
    fetch("/api/carrito/", {
        method:"POST",            
    headers: {
        "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then((json) => carrito_id = json.id)
})

verCarrito.addEventListener("click", ()=>{
    fetch(`/api/carrito/${carrito_id}/productos`)
    .then(response => response.json())
    .then((json) => {
        
        if (json.length == 0) {
            contenido.innerHTML = `<h1>Carrito Vacio</h1>`
        }else{
            const data = json.map( e => {
                return `<div class="card" style="width: 18rem;">
                    <img src="${e.image}" class="card-img-top" alt="">
                    <div class="card-body">
                        <h5 class="card-title">${e.title}</h5>
                        <p class="card-text">${e.description}</p>                        
                    </div>
                    <a onclick="sacarDeCarrito(${e.id})" class="btn btn-primary">Eliminar</a>
                </div>`
            })
            contenido.innerHTML = data.join("")
        }
    })
})

const comprar = (id) => { 
    fetch(`/api/carrito/${carrito_id}/productos`, {
        method:"POST",
        body: JSON.stringify({id: id}),    
    headers: {
        "Content-type": "application/json; charset=UTF-8"
        }
    })        
}

const actualizar = (id) => {
    fetch(`/api/productos/${id}`)
    .then(response => response.json())
    .then((json) => {

        contenido.innerHTML = `
        <form onsubmit=actualizarProd(${json.id}) class="col align-self-center">
            <label for="title">Nombre</label>
            <input name="title" value=${json.title} type="text">
            <label for="descripcion">descripcion</label>
            <input name="description" value=${json.description} type="text">
            <label for="codigo">código</label>
            <input name="codigo" value=${json.codigo} type="text">
            <label for="image">Imagen</label>
            <input name="image" value=${json.image} type="text">
            <label for="price">Precio</label>
            <input name="price" value=${json.price} type="text">
            <label for="count">stock</label>
            <input name="count" value=${json.count} type="text">        
            <input type="submit" value="Agregar">
        </form>`
    })
    
}

const actualizarProd = (id) => {
    fetch(`/api/productos/${id}`, {
        method:"PUT",
        body: JSON.stringify(
            {                
                title: document.querySelector('input[name="title"]').value,
                price: document.querySelector('input[name="price"]').value,
                description: document.querySelector('input[name="description"]').value,
                image: document.querySelector('input[name="image"]').value,
                count: document.querySelector('input[name="count"]').value,
                codigo: document.querySelector('input[name="codigo"]').value
            }),    
    headers: {
        "Content-type": "application/json; charset=UTF-8"
        }
    })
}

const eliminarProd = (id) => { 
    fetch(`/api/productos/${id}`, {
        method:"DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        })
}

const sacarDeCarrito = (id) => { 
    fetch(`/api/carrito/${carrito_id}/productos/${id}`, {
        method:"DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        })
 }