# Desafío: Primera entrega del Proyecto Final
Deploy hecho en [heroku]

## Coderhouse

Consigna: Deberás entregar el estado de avance de tu aplicación eCommerce Backend, que implemente un servidor de aplicación basado en la plataforma Node.js y el módulo express. El servidor implementará dos conjuntos de rutas agrupadas en routers, uno con la url base '/productos' y el otro con '/carrito'. El puerto de escucha será el 8080 para desarrollo y process.env.PORT para producción en glitch.com

Los endpoint para la ruta "/productos" son:

- GET: '/:id?' - Me permite listar todos los productos disponibles ó un producto por su id
- POST: '/' - Para incorporar productos al listado
- PUT: '/:id' - Actualiza un producto por su id
- DELETE: '/:id' - Borra un producto por su id

Y para la ruta "/carrito" son:
- POST: '/' - Crea un carrito y devuelve su id.
- DELETE: '/:id' - Vacía un carrito y lo elimina.
- GET: '/:id/productos' - Me permite listar todos los productos guardados en el carrito
- POST: '/:id/productos' - Para incorporar productos al carrito por su id de producto
- DELETE: '/:id/productos/:id_prod' - Eliminar un producto del carrito por su id de carrito y de producto

Para la prueba de los distintos endpoints se uso el sofware [Postman]

## Tecnologias usadas

- [Express]

[postman]: <https://www.postman.com/>
[Express]: <https://expressjs.com/es/>
[heroku]: <https://cristianbarragan-ch.herokuapp.com/>