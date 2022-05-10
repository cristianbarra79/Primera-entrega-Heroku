const socket = io.connect();

const normalize = normalizr.normalize
const denormalize = normalizr.denormalize
const schema = normalizr.schema


const chat = document.querySelector("#chat");
const input = document.querySelector("#mi-mensaje");
const boton = document.querySelector("#enviar");

const btnMail = document.querySelector("#btnNombre");
const mail = document.querySelector("#mail");

document.getElementById("chat").style.display = "none";
input.style.display = "none";
boton.style.display = "none";

var d = new Date();

fetch("/api/productos-test")
  .then(response => response.json())
  .then((json) => {
  fetch("../../plantilla.txt")
    .then(response => response.text())
    .then(datos => {
        let theTemplateScript = datos;        
        let theTemplate = Handlebars.compile(theTemplateScript);
        
        let context = {
          productos : json
        };
        let theCompiledHtml = theTemplate(context);
        
        $("#tabla").html(theCompiledHtml);
    })
  })



socket.on("mensajes", (data) => {

  const users = new schema.Entity('author', {}, { idAttribute: "author.mail" })

  // Definimos un esquema de comentadores
  const text = new schema.Entity('text', {
      author: users
  })
  const desnormalizados = denormalize(data.result, text, data.entities);  


    const todo = desnormalizados.messages
      .map(
        (e) =>
          `<div>
              <b style="color:#0051FF">${e.author.mail}</b> <span style="color:#C95200">[${e.fyh}]</span>: <i style="color:#28FF01">${e.text}</i> 
          </div>`
      )
      .join(" ");
  
    chat.innerHTML = todo;
});


const first = () => {
  let d = new Date();  
  const mensaje = { 
    author: {
        mail: mail.value, 
        nombre: nombre.value, 
        apellido: apellido.value, 
        edad: edad.value, 
        alias: alias.value,
        avatar: avatar.value
    },
    fyh: d.getDate() + "/" + (d.getMonth() +1) + "/" + d.getFullYear() +" " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(),
    text: input.value
  }
  if (mensaje.mensaje != "") {    
    socket.emit("envio", mensaje);
    input.value = "";
  } else {
    console.log("no hay nada");
  }
};
  
  
const addProduct = (e) => {
    
    const producto = {
        title: document.querySelector('input[name="title"]').value,
        price: document.querySelector('input[name="price"]').value,
        thumbnail: document.querySelector('input[name="thumbnail"]').value
    }
    socket.emit('new-product', producto);
    return false;
};
    
boton.addEventListener("click", first);

btnMail.addEventListener("click", () => {
    if (mail.value == "") {
      alert("Escribi tu nombre");
    } else {
      mail.disabled = true;
      input.disabled = false;
      document.getElementById("chat").style.display = "block";
      document.getElementById("login").style.display = "none";
      input.style.display = "block";
      boton.style.display = "block";
    }
  });