const cards = document.getElementById('cards');
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card')
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()
let carrito = {};

// Se ordena que el objeto Window espera a la ejecucion de JS
document.addEventListener('DOMContentLoaded', () =>{
    fetchData()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
})

cards.addEventListener('click', e => {
    addCarrito(e)
})

items.addEventListener('click', e => {
    btnAccion(e)
})

// El JS espera a la lecura del archivo Json
let fetchData = async ()=>{
    try{
        const res = await fetch('./json/api.json');// el archivo Json es llamado dede el index
        const data = await res.json()
        //console.log(data)
        pintarCards(data)
    } catch (error) {
        console.log(error)
    }
}
// Formacion de las celdas de ventas

const pintarCards = data => {
    data.forEach(producto => {
        const row = document.createElement('div')
        row.innerHTML +=`
        <div class="row row-cols-4 mb-3">
            <div class="card">
                <div class="card-body">
                    <img src="./img/t${producto.id}.png" alt="${producto.title}" class="card-img-top">
                    <h5>${producto.title}</h5>
                    <p>${producto.precio}</p>
                    <p>Total en stock: <span>${producto.stock}</span> unidades</p>
                    <button class="btn btn-dark" data-id="${producto.id}">Comprar</button>
                </div>
            </div>
        </div>`;

        cards.appendChild(row); // Se utiliza una memoria volatil
    
    });
    
}


// Generacion del carrito
const addCarrito = e =>{
    if (e.target.classList.contains('btn-dark')){
        setCarrito(e.target.parentElement)
        //console.log(e.target.parentElement)
    }
    e.stopPropagation()// Evita la activacion de cualquier comando aleatorio
}


const setCarrito = objeto => {
    const producto = {// Forma los campos del carrito
        id: objeto.querySelector('.btn-dark').dataset.id,
        prod:objeto.querySelector('img').getAttribute('src'),
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1,// Se agrega el valor de defecto en la primera compra del producto
        stock:objeto.querySelector('span').textContent
    }

    if (carrito.hasOwnProperty(producto.id)){// Incrementa la cantidad en compras repetidas
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = {...producto}// Incrementa los objeto al array por cada compra
    pintarCarrito()
    console.log("XXX--->",objeto.querySelector('img').getAttribute('src'))
    console.log("Valor del stock-->",objeto.stock)
}

const pintarCarrito = () =>{ // Genera un array de objetos con el contenido del carrito
    items.innerHTML = ''
    Object.values(carrito).forEach(producto => { // Se recorre cada objeto del array para generar las variables
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelector('img').setAttribute('src', producto.prod)
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    console.log('XXX---->',carrito)
    items.appendChild(fragment)

    pintarFooter()

    localStorage.setItem('carrito', JSON.stringify(carrito))
}
// Construccion del footer del carrito
const pintarFooter = () => {
    footer.innerHTML = ''
    if(Object.keys(carrito).length === 0) {
        footer.innerHTML = 
        `<th scope="row" colspan="5">Carrito vacío - comience a comprar</th>` 
        return      
    }
    const nCantidad = Object.values(carrito).reduce((acc,{cantidad}) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc,{cantidad, precio}) => acc + cantidad * precio, 0)
    
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad// Cantidad total
    templateFooter.querySelector('span').textContent = nPrecio// Precio total

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()
    })
}

const btnAccion = e => {

    let arrayCarritoStock = Object.values(carrito);
    let arrayStock = [];
    for (let i = 0; i < arrayCarritoStock.length; i++) {
        for (let key in arrayCarritoStock[i]) { 
            if (arrayCarritoStock[i].hasOwnProperty(key) && key === "stock") {
                arrayStock.push(arrayCarritoStock[i][key]);
            }
        }
    }
    console.log("Prueba de array de stock-->",arrayStock)

    //console.log("Tipo de Valor del stock-->",typeof Object.values(carrito));
    //console.log("Valor del array 1-->",carritoStock);
    //for (const [stock, value] of Object.entries(carritoStock))
    //const valorStock = Object.values(carrito).find(element => element == 'stock');
    //console.log("Valor del stock 1-->",carritoStock.id.stock);
    
    
    if (e.target.classList.contains('btn-info')) {
        //carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]      
        producto.cantidad++// Incremento la cantidad en 1 por cada producto
        carrito[e.target.dataset.id] = {...producto}
        pintarCarrito()
        
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--// Decrementa la cantidad en 1 por cada producto
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito()
    }


    e.stopPropagation()// Evita la activacion de cualquier comando aleatorio
}
