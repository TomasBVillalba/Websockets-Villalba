import express from 'express';
import ProductRouter from './router/product.routes.js';
import CartRouter from './router/carts.routes.js';
import { engine } from 'express-handlebars';
import * as path from 'path';
import __dirname from './utils.js';
import ProductManager from './controllers/ProductManager.js';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
const app = express();
const httpserver = app.listen (8080, () =>  console.log ("Servidor en linea"))
const socketServer = new Server(httpserver);
const product = new ProductManager();



app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Handlebars
app.engine ("handlebars", handlebars.engine())
app.set("view engine","handlebars")
app.set("views", path.resolve(__dirname + "/views"));

// static
app.use("/", express.static(__dirname + "/public"))

// SocketServer
const logs = []
socketServer.on('connection', socket =>{
    console.log ("inicio de comunicacion")

    socket.on('message',data=>{
        logs.push({socketid:socket.id,message:data})
        socketServer.emit('log',{logs})
    })
})



app.get("/", async (req, res) => {
    let allProducts = await product.getProducts();
    res.render("home", {
        title: "MarteleArtesanias",
        products : allProducts,
    })
})

app.get("/:id", async (req, res) => {
    let prod = await product.getProductsById(req.params.id);
    res.render("prod", {
        title: "MarteleArtesanias",
        products : prod
    })
})

app.use("/api/products", ProductRouter);
app.use("/api/cart", CartRouter);


