////////////////////// models //////////////////////////
const UsuarioNewsletter=require('../models/UsuarioNewsletter');
const Categoria=require('../models/Categoria');
const Catalogo=require('../models/Catalogo');
const Evento=require('../models/Evento');
const Productos=require('../models/Productos');
const Marcas=require('../models/Marcas');
const User=require('../models/User');
const Orden=require('../models/Orden');
const Transporte=require('../models/Transporte');
const GiftCard=require('../models/GiftCard');
const Notificacion = require('../models/Notificacion');
const ProductosAdicional = require('../models/ProductosAdicional');
////////////////////////////// helpers //////////////////////////////
const cloudinary = require('../helpers/Cloudinary');
const { helperImg } = require('../helpers/Sharp');
const { notificationAdmin } = require('../helpers/AdminHelpers');
const { fechaformateada }=require('../helpers/formato');
const { errorHandler } = require('../helpers/dbErrorHandling');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class AdminController{
    static getAttributesAditional = async(req,res)=>{
        const response = await Productos.find({},{"adicional":1,"colores":1,"tallas":1,"otrasCaracteristicas":1});
        const aditional = [];
        const adicional = [];
        const tamano = [];
        let tallas = [];
        const colores = [];
        const color = [];
        let otrasCaracteristicas = [];
        const otras = [];
        if(response){
            response.forEach(element=>{
                element.adicional.forEach(a=>{

                    if(a!=='' && a.precio !==null){
                        aditional.push(a);
                    }

                })

                element.tallas.forEach(t=>{
  
                    if(t!=='' && t.tallavalor !==null){
                        tamano.push(t);
                    }

                })

                element.colores.forEach(c => {
                    if(c.colornombre!=='' && c.colornombre!==null){
                      colores.push(c);
                    }
                });

                element.otrasCaracteristicas.forEach(o =>{
                    if(o.atributo!=='' && o.atributo!==null){
                        otras.push(o);
                    }
                })
            })
            let set = new Set(otras.map(JSON.stringify))
            otrasCaracteristicas = Array.from(set).map(JSON.parse);
         
            const aditionals = [... new Set(aditional.map(x=>x.nombre.toLowerCase()))];
            aditionals.forEach(element=>{
                let a=aditional.find(x=>x.nombre.toLowerCase() === element);
                adicional.push(a);
            });
            const colors = [... new Set(colores.map(x=>x.colornombre.toLowerCase()))];
            colors.forEach(element=>{
                let c=colores.find(x=>x.colornombre.toLowerCase() === element);
                color.push(c);
            })
            set = new Set(tamano.map(JSON.stringify))
            tallas = Array.from(set).map(JSON.parse);

            const data = {
                adicional,
                color,
                tallas,
                otrasCaracteristicas,
            };
            res.status(200).json(data);
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
      
    }
    static getOrdenUser = async(req,res)=>{
        const id = req.params.id;
        console.log(id);
        const orden = await Orden.find({"user._id":id})
      
        if(orden){
            return res.status(200).json(orden);
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getEventosById = async(req,res)=>{
        const id = req.params.id;
        const eventos = await Evento.findById(id);

        if(eventos){
            return res.status(200).json({data:eventos});
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getEventos = async(req,res)=>{
        const eventos = await Evento.find();

        if(eventos.length > 0){
            return res.status(200).json({data:eventos});
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static deleteEventos = async(req,res)=>{
        const id = req.params.id;
        const response = await Evento.findByIdAndDelete(id);

        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const notiData = {
            titulo:`Evento Eliminado`,
            descripcion:`${u.nombre} ${u.apellido} ha eliminado un evento`,
            icon:`event_busy`,
            iconcolor:`text-danger`,
            tipo:`Eventos`,
            url:`/admin/notificacion`
        }
        const resp = notificationAdmin(notiData);
        if(response){
            return res.status(200).json({"res":true});
        }else{
            res.status(400).json({errors:["No se encuentra esa Publicacíon"]});
        }
    }

    static putEventos = async(req,res)=>{
        const {id,dateInit,dateEnd,description,title,color} = req.body.value;
        let body = req.body.value;
        const data = req.body.data;
        body.data = data;
        const response = await Evento.findByIdAndUpdate(id,{dateInit,dateEnd,description,title,color,data})

        body.id = response._id;
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const notiData = {
            titulo:`Evento modificado`,
            descripcion:`${u.nombre} ${u.apellido} ha modificado un evento`,
            icon:`edit_calendar`,
            iconcolor:`text-primary`,
            tipo:`Eventos`,
            url:`/admin/notificacion`
        }
        const resp = notificationAdmin(notiData);
        if(body){
            return res.status(200).json({"res":true,"data":body});
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }

    static postEventos = async(req,res)=>{
        let body = req.body.value;
        body.data = req.body.data;
        const model = new Evento(body);
        const response = await model.save();

        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const notiData = {
            titulo:`Nuevo Evento`,
            descripcion:`${u.nombre} ${u.apellido} ha agregado un evento`,
            icon:`event_available`,
            iconcolor:`text-success`,
            tipo:`Eventos`,
            url:`/admin/notificacion`
        }
        const resp = notificationAdmin(notiData);

        body.id = response._id;
        if(body){
            return res.status(200).json({"res":true,"data":body});
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getDashBoardData = async(req,res)=>{
         const orden = await Orden.find();

         let data = {
             totalorden:{
                 value:0,
                 percentage:4.25,
                 sing:"+"
             },
             income:{
                value:0,
                percentage:0,
                sing:"+"
             },
             profits:{
                value:0,
                percentage:0,
                sing:"+"
             },
             charts:{
                 productstotal:[0,0,0,0,0,0,0,0,0,0,0,0],
                 productsquality:[0,0,0,0,0,0,0,0,0,0,0,0]
             }
         };
         const now = new Date();
         const mac = now.getMonth();
         const mant = mac-1;
         let cantan = 0;
         let cantac = 0;
         orden.forEach(element => {
             if(element.estado !== 'Cancelado' && element.estado !=='Pendiente'){
                data.totalorden.value++;
                data.income.value+= element.total
                let d = new Date(element.createdAt);
                let i = d.getMonth();
                data.charts.productstotal[i]+=element.total;
                data.charts.productsquality[i]+=element.items.cantidad;
                if(mac === i) {
                    data.profits.value+= element.total;
                    cantac++;
                }

                if(mac === i-1){
                    cantan++;
                }
             }
         })
         
         let vptp = 0;
         let vop = 0;
         if(cantac > cantan){
            vop = cantan !== 0 ? (cantac-cantan)/cantan*100 : 100;
            data.totalorden.sing = "+";
         }else{
            vop = cantan !== 0 ? (cantan-cantac)/cantan*100 : 100;
            data.totalorden.sing = "-";
         }
         data.totalorden.percentage = vop.toFixed(2);
         if(data.charts.productstotal[mac] > data.charts.productstotal[mant]){
             vptp = data.charts.productstotal[mant] !== 0 ? (data.charts.productstotal[mac]-data.charts.productstotal[mant])/data.charts.productstotal[mant]*100:100;
             data.income.percentage = vptp.toFixed(2);
             data.profits.percentage = vptp.toFixed(2);
             data.income.sing = "+";
             data.profits.sing = "+";
         }else{
            vptp = data.charts.productstotal[mac] !== 0 ? (data.charts.productstotal[mant]-data.charts.productstotal[mac])/data.charts.productstotal[mant]*100:100;
            data.income.percentage = vptp.toFixed(2);
            data.income.sing = "-";
            data.profits.sing = "-";
         }

        if(data){
          res.status(200).json(data);
        }else{
          res.status(500).send({errors:["No se encuentra esa Publicacíon"]});
        } 
    }

    static getGiftCard = async(req,res) =>{
        const gift = await GiftCard.find();
        if(gift.length > 0){
            return res.status(200).json(gift);
        }else{
            return res.status(400).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static postGiftCard = async(req,res)=>{

        try{
            const body = req.body;
            
            body.img = 'assets/image/storage/giftcard/giftcard.png';
            const model = new GiftCard(body);
            const response = await model.save();

            if(response){
                res.status(200).json({"res":true,"title":"","message":"Gift Card agregado con exito"});
            }else{
                res.status(500).send({"res":false,"title":"","message":"Gift Card no registrado"});
            }   
        }catch(error){
            console.log(error);
        }
        
    }
    static putGiftCard = async(req,res)=>{
        try{
            const {id,name,code,description,state,validater,userId,value,portada} = req.body;
            let img = portada;
            const response = await GiftCard.findByIdAndUpdate(id,{name,code,description,state,validater,userId,value,img});
            console.log(response);
            if(response){
                res.status(200).json({"res":true,"title":"","message":"Gift Card editado con exito"});
            }else{
                res.status(500).send({"res":false,"title":"","message":"Gift Card no pudo ser editado"});
            }
        }catch(error){
            console.log(error);
        }

    }
    static deleteGiftCard = async(req,res)=>{
        const id = req.params.id;
        const response = await GiftCard.findByIdAndDelete(id);
        if(response){
            res.status(200).json({"res":true,"title":"","message":"Gift Card eliminado con exito"});
        }else{
            res.status(500).send({"res":false,"title":"","message":"Gift Card no pudo ser eliminado"});
        }
    }
    static getTransporte = async(req,res) =>{
        const transporte = await Transporte.find();
        if(transporte.length > 0){
            return res.status(200).json(transporte);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static postTransporte = async(req,res) =>{
        const body = req.body;

        const transporteModel = new Transporte(body);
        const response = await transporteModel.save();
        if(response){
            res.status(200).json({"res":true,"title":"","message":"Transporte agregado con exito"});
        }else{
            res.status(500).send({"res":false,"title":"","message":"Transporte no registrado"});
        }         
    }
    static putTransporte = async(req,res) =>{
        const {id,nombre,tiempoentrega,tiempodeenvio,descripcion,precio,anchura,altura,profundidad,peso}= req.body;
        const dimensiones = {
            anchura,
            altura,
            profundidad
        }
        
        const response = await Transporte.findByIdAndUpdate(id,{nombre,tiempoentrega,tiempodeenvio,descripcion,precio,dimensiones,peso});
        if(response){
            res.status(200).json({"res":true,"title":"","message":"Transporte modificado con exito"});
        }else{
            res.status(500).send({"res":false,"title":"","message":"Transporte no modificado"});
        }         
    }

    static deleteTransporte = async(req,res) =>{
        const id = req.params.id;
        const response = await Transporte.findByIdAndDelete(id);
        if(response){
            res.status(200).json({"res":true,"title":"","message":"Transporte eliminado con exito"});
        }else{
            res.status(500).send({"res":false,"title":"","message":"Transporte no pudo ser eliminado"});
        }
    }
    static getOrden = async(req,res) =>{
        const orden = await Orden.find();
        if(orden.length > 0){
            return res.status(200).json(orden);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static deleteOrden = async(req,res) =>{
        const id=req.params.id;
        const orden = await Orden.findByIdAndDelete(id);
        if(orden){
            return res.status(200).json({"res":true,"message":"orden eliminada con exito"});
        }else{
            return res.status(404).json({"res":false,"message":"error al eliminar orden"});
        }
    }

    static getOrdenDetails = async(req,res) =>{
        const id=req.params.id;
        const orden = await Orden.findById(id);
        if(orden){
            return res.status(200).json(orden);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }

    static getUser = async(req,res)=>{
        const user=await User.find();
        if(user.length > 0){
            return res.status(200).json(user);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static putUser = async(req,res) =>{
        let {id,nombre,apellido,rut,email,telefono,password,role,imgavatar} = req.body;
        let avatar;
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        if(req.file){
            avatar = `assets/image/avatar/${req.file.filename}`;
        }else{
            avatar = imgavatar;
        }
        const response= await User.findByIdAndUpdate(id,{nombre,apellido,rut,email,telefono,role,avatar});
        if(response){
            const usersAdmin = await User.find({role:"admin"});
            const fecha = new Date();
            let notification = {};
            usersAdmin.forEach(async element => {
                notification = {
                    id:element._id,
                    titulo:`Usuario Modificado`,
                    descripcion:`${u.nombre} ${u.apellido} ha modificado al usuario ${nombre} ${apellido}`,
                    icon:'manage_accounts',
                    iconcolor:'text-primary',
                    tipo:'Usuarios',
                    leido:true,
                    fecha:fechaformateada(fecha,'LLLL'),
                    url:'/admin/usuarios'
                }
                let modelNotification = new Notificacion(notification);
                await modelNotification.save();
            });
            return res.status(200).json({"res":true,"message":"Usuario Modificado"});
        }else{
            return res.status(500).json({"res":false,"message":"Usuario no registrado"});
        }
       
    }
    static postUser = async(req,res) =>{
        let body = req.body;
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        if(req.file){
            body.avatar = `assets/image/avatar/${req.file.filename}`;
        }else{
            body.avatar = `assets/image/avatar/img12.jpg`;
        }
        const userModels = new User(body);
        const response= await userModels.save();
        if(response){
            const usersAdmin = await User.find({role:"admin"});
            const fecha = new Date();
            let notification = {};
            usersAdmin.forEach(async element => {
                notification = {
                    id:element._id,
                    titulo:`Usuario Agregar`,
                    descripcion:`${u.nombre} ${u.apellido} ha agregado al usuario ${body.nombre} ${body.apellido}`,
                    icon:'person_add',
                    iconcolor:'text-success',
                    tipo:'Usuarios',
                    leido:true,
                    fecha:fechaformateada(fecha,'LLLL'),
                    url:'/admin/usuarios'
                }
                let modelNotification = new Notificacion(notification);
                await modelNotification.save();
            });
            return res.status(200).json({"res":true,"message":"Usuario registrado"});
        }else{
            return res.status(500).json({"res":false,"message":"Usuario no registrado"});
        }
       
    }
    static deleteUser = async(req,res)=>{
        const id=req.params.id;
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const resp=await User.deleteOne({_id:id});
     
            const usersAdmin = await User.find({role:"admin"});
            const fecha = new Date();
            let notification = {};
            usersAdmin.forEach(async element => {
                notification = {
                    id:element._id,
                    titulo:`Usuario Eliminado`,
                    descripcion:`${u.nombre} ${u.apellido} ha eliminado a un usuario`,
                    icon:'person_remove',
                    iconcolor:'text-danger',
                    tipo:'Usuarios',
                    leido:true,
                    fecha:fechaformateada(fecha,'LLLL'),
                    url:'/admin/usuarios'
                }
                let modelNotification = new Notificacion(notification);
                await modelNotification.save();
            });
        res.status(200).json({"res":true,"id":id,"data":resp,"title":"Usuario eliminado","message":"Usuario eliminado exitosamente"});
    }
    static getMarcas = async(req,res)=>{
        const marcas = await Marcas.find();

        if(marcas.length > 0){
            return res.status(200).json(marcas);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }

    static postMarcas = async(req,res)=>{
        let marcas=req.body;
        let logo='';

        if(req.file){
            logo=`assets/storage/catalogo/${req.file.filename}`;
            const result=await cloudinary.v2.uploader.upload(req.file.path);
            console.log(result);
        }
        marcas.logo = logo;
 
        const marcasModel = new Marcas(marcas);
        const response = await marcasModel.save();
        if(response){
           return res.status(200).json({"res":true,"title":"Marcas registrada","message":"Marcas registrada con exito"});
        }else{
           return res.status(500).send({"res":false,"message":"Marcas no se pudo registrar"});
        }
    }
    static putMarcas = async(req,res)=>{
        let {id,nombre,descripcion,logo}=req.body;

        if(req.file){
            logo=`assets/storage/catalogo/${req.file.filename}`;
        }
    
        const response = await Marcas.findByIdAndUpdate(id,{nombre,descripcion,logo});
        if(response){
           return res.status(200).json({"res":true,"title":"Marcas modificada","message":"Marcas modificada con exito"});
        }else{
           return res.status(500).send({"res":false,"message":"Marcas no se pudo modificar"});
        }
    }
    static deleteMarcas = async(req,res)=>{
        const id=req.params.id;
        const resp=await Marcas.deleteOne({_id:id});
        res.status(200).json({"res":true,"id":id,"data":resp,"title":"Marca eliminado","message":"Marca eliminado exitosamente"});
    }

    static getCatalogo = async(req,res)=>{
        const catalogo= await Catalogo.find();
        if(catalogo.length > 0){
            return res.status(200).json(catalogo);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static postCatalogo = async(req,res)=>{
        let catalogo=req.body;
        let portada='';
        let pdf='';

        if(req.files){
            portada=`assets/storage/catalogo/${req.files.portadacatalogo[0].filename}`;
            pdf=`assets/storage/catalogo/${req.files.pdfcatalogo[0].filename}`;
        }
        catalogo.portada = portada;
        catalogo.pdf = pdf;
        const catalogoModel = new Catalogo(catalogo);
        const response = await catalogoModel.save();
        if(response){
           return res.status(200).json({"res":true,"title":"Catálogo registrado","message":"Catálogo registrado con exito"});
        }else{
           return res.status(500).send({"res":false,"message":"Catalogo no se pudo registrar"});
        }
    }

    static editCatalogo = async(req,res)=>{
        const {id,titulo,issuu,descripcion,portadaurl,pdfurl} = req.body;
        let catalogo=req.body;
        let portada='';
        let pdf='';

        if(req.files){
            portada=`assets/storage/catalogo/${req.files.portadacatalogo[0].filename}`;
            pdf=`assets/storage/catalogo/${req.files.pdfcatalogo[0].filename}`;
        }else{
            portada=portadaurl;
            pdf=pdfurl;
        }
        const response= await Catalogo.findByIdAndUpdate(id,{titulo,issuu,descripcion,portada,pdf});
        if(response){
           return res.status(200).json({"res":true,"title":"Catálogo registrado","message":"Catálogo registrado con exito"});
        }else{
           return res.status(500).send({"res":false,"message":"Catalogo no se pudo registrar"});
        }
    }

    static deleteCatalogo = async(req,res)=>{
        const id=req.params.id;
        const resp=await Catalogo.deleteOne({_id:id});
        res.status(200).json({"res":true,"id":id,"data":resp,"title":"Catálogo eliminado","message":"Catálogo eliminado exitosamente"});
    }
    
    static getProductos = async(req,res)=>{
        const productos = await Productos.find();
        if(productos){
            return res.status(201).json(productos);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
  
    static getProductoById = async(req,res)=>{
        const id=req.params.id;
        const producto = await Productos.findById(id);
     
        if(producto){
            return res.status(200).json(producto);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }

    static postProductos = async(req,res)=>{
        let productos=req.body;
        //console.log(productos);
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const adicional = [];
        const tallas = [];
        const colores= [];
        const material = [];
        const imagenproductos=[];
        const otrasCaracteristicas=[];
        const tags=req.body.tags;
        const transporte = {
            transport: productos.transport,
            anchura: productos.anchura,
            altura: productos.altura,
            profundidad: productos.profundidad,
            peso: productos.peso,
            costosporkilometro:productos.costosporkilometro
        }

        if(req.files){
            req.files.forEach(element => {
                const filename=element.filename;
                const ruta=`assets/storage/productos/${filename}`;
                imagenproductos.push(ruta);
            });
    
            productos.imagenproductos=imagenproductos;
        }
        if(typeof(productos.otrosvalor) === 'object'){
            productos.otrosvalor.forEach((element,i) =>{
                otrasCaracteristicas.push({
                    atributo:productos.otros[i],
                    valor:element
                })
            })
        }else{
            if(productos.otros !== '' && productos.otros){
                otrasCaracteristicas.push({
                    atributo:productos.otros,
                    valor:productos.otrosvalor  
                })
            }
        }
        if(typeof(productos.colorcodigo) === 'object'){
            productos.colorcodigo.forEach((element,i) =>{
                colores.push({
                    colorcodigo:element,
                    colornombre:productos.colornombre[i],
                    colorcantidad:productos.colorcantidad[i]
                })
            })
        }else{
            if(productos.colorcodigo !== '' && productos.colorcodigo){
                colores.push({
                    colorcodigo:productos.colorcodigo,
                    colornombre:productos.colornombre,
                    colorcantidad:productos.colorcantidad
                })
            }
        }
        if(typeof(productos.tallavalor) === 'object'){
            productos.tallavalor.forEach((element,i)=>{
                tallas.push({
                    tallavalor:element,
                    tallatipo:productos.tallatipo[i],
                    tallacantidad:productos.tallacantidad[i],
                }) 
            })
        }else{
            if(productos.tallavalor !== '' && productos.tallavalor){
                tallas.push({
                    tallavalor:productos.tallavalor,
                    tallatipo:productos.tallatipo,
                    tallacantidad:productos.tallacantidad,
                }) 
            }
        }
        
        if(typeof(productos.materialnombre) === 'object'){
            
            productos.materialnombre.forEach((element,i)=>{
                material.push({
                    materialnombre:element,
                    materialtipo:productos.tallatipo[i],
                    materialcantidad:productos.tallacantidad[i],
                }) 
            })

        }else{
            if(productos.materialnombre !== '' && productos.materialnombre){
                material.push({
                    materialnombre:productos.materialnombre,
                    materialtipo:productos.tallatipo,
                    materialcantidad:productos.tallacantidad,
                }) 
            }
        }
        if(typeof(productos.adicionalnombre) === 'object'){
            productos.adicionalnombre.forEach((element,i)=>{
                adicional.push({
                    nombre:element,
                    precio:productos.adicionalprecio[i]
                })
            })
        }else{
            if(productos.adicionalnombre !=='' && productos.adicionalnombre){
                adicional.push({
                    nombre:productos.adicionalnombre,
                    precio:productos.adicionalprecio
                })
            }
        }
        productos.estado=true;
        productos.tallas = tallas;
        productos.colores=colores;
        productos.transporte=transporte;
        productos.otrasCaracteristicas = otrasCaracteristicas;
        productos.ratings=0;
        productos.ratingscantidad=0;
        productos.visitas=0;
        productos.tags = tags;
        productos.adicional = adicional;
    
        let productosModel = new Productos(productos);
        const re = await productosModel.save();
        console.log(re);
        const descripcion=`${u.nombre} ${u.apellido} ha agregado el producto ${productos.titulo}`;
        const notiData = {
            titulo:`Producto agregado`,
            descripcion:descripcion,
            icon:`add_business`,
            iconcolor:`text-success`,
            tipo:`productos`,
            url:`/admin/put-product/${re._id}`
        }
        const resp = notificationAdmin(notiData);

        res.json({"res":true,"data":productos,title:"Producto agregado",message:descripcion});
    }

    static putProductos = async(req,res)=>{
        let productos=req.body;
        console.log(productos);
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const {id, tags} = productos;
        const tallas = [];
        const colores= [];
        const material = [];
        const imagenproductos=[];
        const otrasCaracteristicas=[];
        const transporte = {
            transport: productos.transport,
            anchura: productos.anchura,
            altura: productos.altura,
            profundidad: productos.profundidad,
            peso: productos.peso,
            costosporkilometro:productos.costosporkilometro
        }
        if(typeof(productos.otrosvalor) === 'object'){
            productos.otrosvalor.forEach((element,i) =>{
                otrasCaracteristicas.push({
                    atributo:productos.otros[i],
                    valor:element
                })
            })
        }else{
            otrasCaracteristicas.push({
                atributo:productos.otros,
                valor:productos.otrosvalor  
            })
        }
        if(typeof(productos.colorcodigo) === 'object'){
            productos.colorcodigo.forEach((element,i) =>{
                colores.push({
                    colorcodigo:element,
                    colornombre:productos.colornombre[i],
                    colorcantidad:productos.colorcantidad[i]
                })
            })
        }else{
            colores.push({
                colorcodigo:productos.colorcodigo,
                colornombre:productos.colornombre,
                colorcantidad:productos.colorcantidad
            })
        }
        if(typeof(productos.tallavalor) === 'object'){
            productos.tallavalor.forEach((element,i)=>{
                tallas.push({
                    tallavalor:element,
                    tallatipo:productos.tallatipo[i],
                    tallacantidad:productos.tallacantidad[i],
                }) 
            })
        }else{
            tallas.push({
                tallavalor:productos.tallavalor,
                tallatipo:productos.tallatipo,
                tallacantidad:productos.tallacantidad,
            }) 
        }
        
        if(typeof(productos.materialnombre) === 'object'){

            productos.materialnombre.forEach((element,i)=>{
                material.push({
                    materialnombre:element,
                    materialtipo:productos.tallatipo[i],
                    materialcantidad:productos.tallacantidad[i],
                }) 
            })

        }else{
            material.push({
                materialnombre:productos.materialnombre,
                materialtipo:productos.tallatipo,
                materialcantidad:productos.tallacantidad,
            }) 
        }
      
        if(typeof(productos.img) === 'string' ){
            imagenproductos.push(productos.img);
        }else if(productos.img){
            productos.img.forEach(element=>{
                imagenproductos.push(element);
            })
        }
        const imagenproductosOptimizada = []
        if(typeof(productos.imgOptimize) === 'string' ){
            imagenproductosOptimizada.push(productos.imgOptimize);
        }else if(productos.imgOptimize){
            productos.img.forEach(element=>{
                imagenproductosOptimizada.push(element);
            })
        }
        
         if(req.files){
            req.files.forEach(element => {
                console.log(element)
                const filename=element.filename;
                const rutarelativa = `../src/assets/storage/productos/${filename}`;
                const ruta=`assets/storage/productos/${filename}`;
                const ruta1 = `assets/storage/productos/resize-${filename}`;
                helperImg(rutarelativa,`resize-${filename}`,300);
                imagenproductos.push(ruta);
                imagenproductosOptimizada.push(ruta1);
            });
        }

        const {codigo,titulo,categoria,subcategoria,marcas,descripcion,cantidad,precio,descuentos} = productos;

        const response = await Productos.findByIdAndUpdate(id,{codigo,titulo,categoria,subcategoria,marcas,descripcion,cantidad,precio,descuentos,material,colores,imagenproductos,imagenproductosOptimizada,tallas,transporte,otrasCaracteristicas});
        console.log(response);
        if(response){
            const notiData = {
                titulo:`Producto modificado`,
                descripcion:`${u.nombre} ${u.apellido} ha modificado el producto ${titulo}`,
                icon:`store`,
                iconcolor:`text-primary`,
                tipo:`productos`,
                url:`/admin/put-product/${id}`
            }
            const resp = notificationAdmin(notiData);
        }
        res.json({"res":true,"data":productos});
    }

    static deleteProductos = async(req,res)=>{
        const id=req.params.id;
        const h = req.headers;
        const u = jwt.decode(h.authorization.replace('Bearer ',''));
        const response = await Productos.deleteOne({_id:id});
        if(response){
            const notiData = {
                titulo:`Producto eliminado`,
                descripcion:`${u.nombre} ${u.apellido} ha eliminado un producto`,
                icon:`store`,
                iconcolor:`text-danger`,
                tipo:`productos`,
                url:`/admin/productos`
            }
            const resp = notificationAdmin(notiData);
        }
        res.json({"res":true});
    }

    static getCategoria = async(req,res) =>{
        const categoria=await Categoria.find();
    
        if(categoria){
            return res.status(201).json(categoria);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }

    }
    static deleteCategoria = async(req,res)=>{
        const id=req.params.id;
        const resp=await Categoria.deleteOne({_id:id});
  
        res.json({"res":true,"id":id,"data":resp});
    }
    static postCategoria = async(req,res)=>{
        let body=req.body;

        if(req.file){
            const filename=req.file.filename;
            const ruta=`assets/storage/categorias/${filename}`;
            body.imagen=ruta;
        }else{
            body.imagen='';
        }
        let categoriaModel = new Categoria(body);
   
        await categoriaModel.save();

        res.json({"res":true,"data":body});
    }
    static putCategoria = async(req,res)=>{
        let {id,nombre,descripcion,posicion,estado,childrem,urlimg}=req.body;
        let imagen;
        
        if(req.file){
            const filename=req.file.filename;
            const ruta=`assets/storage/categorias/${filename}`;
            imagen=ruta;
        }else{
            imagen=urlimg;
        }
        const updatedCategory= await Categoria.findByIdAndUpdate(id,{nombre,imagen,descripcion,posicion,estado,childrem});

        res.json({"res":true,"data":updatedCategory});
    }

}

module.exports = AdminController;