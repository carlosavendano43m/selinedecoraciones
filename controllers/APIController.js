const jwt = require('jsonwebtoken');

const UsuarioNewsletter=require('../models/UsuarioNewsletter');
const Catalogo=require('../models/Catalogo');
const Categoria=require('../models/Categoria');
const GiftCard=require('../models/GiftCard');
const Productos=require('../models/Productos');
const Ratings=require('../models/Ratings');
const Region = require('../models/Region');
const Transporte=require('../models/Transporte');
const Orden=require('../models/Orden');

const {fechaformateada} = require('../helpers/formato');

class APIController{
    static getProductoSearch = async(req,res)=> {
        const query = req.query;
        console.log(query);
        return res.json(query);
    }

    static getMenus = async(req,res)=>{
        const category = await Categoria.find();
        const productos = await Productos.find();

        const data = [];
        if(category.length > 0) {
            category.forEach(element=>{
                let items = [];
                productos.forEach(x=>{
                    if(x.categoria === element.nombre){
                        items.push(x)
                    }
                })
                data.push({
                    title:element.nombre,
                    items
                })
            })
            res.status(200).json({data});
        }else{
            res.status(500).json({"res":false})
        }
        
    }

    static getOptionShipping = async(req,res)=>{
        const body = req.body;
   
        try{
            const data = [];
            const response = await Transporte.find();
            body.forEach(element=>{
                if(response.length > 0){
                    response.forEach(x=>{
                        if(x.nombre === element){
                            data.push(x);
                        }
                    })
                }
            });
            res.status(200).json({"res":true,"data":data});
        }catch(error){
            res.status(404).json({"res":false,"title":"","message":"Error del servidor"});
        }
    }
    static getTracking = async(req,res) =>{
        const tracking = req.params.id;

        try{
            const orden = await Orden.findOne({tracking});
            if(orden){
                res.status(200).json({"res":true,"data":orden});
            }else{
                res.status(500).json({"res":false,"title":"","message":"No encontramos el número ingresado, prueba de nuevo"});
            }
        }catch(error){
            res.status(404).json({"res":false,"title":"","message":"Error del servidor"});
        }

    }

    static postTracking = async(req,res) =>{
        const { tracking, email } = req.body;
        const orden = await Orden.findOne({tracking})
        if(orden){
            res.status(200).json({"res":true,"data":orden});
        }else{
            res.status(500).json({"res":false,"title":"","message":"No encontramos el número ingresado, prueba de nuevo"});
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

    static getCatalogo = async(req,res)=>{
        const catalogo= await Catalogo.find();
        if(catalogo.length > 0){
            return res.status(200).json(catalogo);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getCatalogoDetails = async(req,res)=>{
        const id=req.params.id;
        const catalogo= await Catalogo.findById(id);

        if(catalogo){
            return res.status(200).json(catalogo);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    
    static getRatings= async(req,res)=>{
        const id=req.params.id;
        const ratings=await Ratings.find({id:id});
        
        if(ratings){
            const promediototal=await Ratings.aggregate([{$match:{id:id}},
                {$group:
                    {
                        _id:"$id",
                        total:{$sum:1},
                        promedio:{$avg:"$calificacion"}
                      
                    },
                     
                },
            
            ]);

            let prototal;
            if(promediototal.length > 0){
                prototal=promediototal[0];
            }else{
                prototal={
                    total:0,
                    promedio:0
                }
            }
            const rs=await Ratings.aggregate([{$match:{id:id}},
                {$group:
                    {
                        _id:"$calificacion",
                        cantidad:{$sum:1},
                        totales:{$sum:"$calificacion"},
                    },
                },
            ])

            if(rs){
   
                let ratingspromedio=[
                    { 
                        star: 5,
                        cantidad:0,
                        promedio:0,
                    },
                    { 
                        star: 4,
                        cantidad:0,
                        promedio:0,
                    },
                    { 
                        star: 3,
                        cantidad:0,
                        promedio:0,
                    },
                    { 
                        star: 2,
                        cantidad:0,
                        promedio:0,
                    },
                    { 
                        star: 1,
                        cantidad:0,
                        promedio:0,
                    }                
                ];
                
                let total=0;
                rs.forEach(element=>{
                    total+=element.cantidad;
                })
              
                rs.forEach(element=>{
                    if(ratingspromedio.findIndex(item => item.star === element._id) > -1){
                        let i=ratingspromedio.findIndex(item => item.star === element._id);
                        ratingspromedio[i].cantidad=element.cantidad;
                        ratingspromedio[i].promedio=(element.cantidad/total*100).toFixed(2);
                    }
                })

                const rating={
                    ratings:ratings,
                    ratingpromedios:ratingspromedio,
                    ratingpromediototal:prototal
                }
                res.status(200).json(rating);
            }
            
           
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }

        
    }
    static postRatings = async(req,res)=>{
        const body=req.body;
        const id=req.body.id;
        body.like=0;
        body.dislike=0;
        body.avatar='assets/image/avatar/img12.jpg';
        body.fecha=fechaformateada(new Date(),'LL');

        let ratingsModel = new Ratings(body);
        const respu=await ratingsModel.save();

        const promediototal=await Ratings.aggregate([{$match:{id:id}},
            {$group:
                {
                    _id:"$id",
                    total:{$sum:1},
                    promedio:{$avg:"$calificacion"}
                  
                },
                 
            },
        
        ]);
        if(promediototal){
            const promedio=promediototal[0].promedio.toFixed(1);
            const puntuaciontotal=promediototal[0].total;
            const rest=await Productos.findByIdAndUpdate(id,{ratings:promedio,ratingscantidad:puntuaciontotal});
        }
        res.json({"res":true,"data":respu});
    }
    static postLikeRatings = async(req,res)=>{
        const id=req.body.id;
        await Ratings.findByIdAndUpdate(id,{ $inc: {like:1}});
        res.json({"res":true});
    }
    static postDisLikeRatings = async(req,res)=>{
        const id=req.body.id;
        await Ratings.findByIdAndUpdate(id,{ $inc: {dislike:1}});
        res.json({"res":true});
    }
    static getProductos = async(req,res)=>{
        const productos = await Productos.find().sort({ "createdAt": -1 });

        if(productos){
            return res.status(200).json(productos);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }

    }
    static getProductosHome = async(req,res)=>{
        const destacados = await Productos.find().limit(20).sort( { "createdAt": -1 } );
        const ultimosproductos = await Productos.find().limit(4).sort( {"createdAt": -1 } );
        const masvalorado = await Productos.find().limit(4).sort( {"ratings": -1 } );
        const superventas = await Productos.find().limit(4).sort( {"precio":1});

        const productos={
            "destacados":destacados,
            "ultimosproductos":ultimosproductos,
            "masvalorado":masvalorado,
            "superventas":superventas
        }
        if(productos){
            return res.status(200).json(productos);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getProductosDetalles = async(req,res)=>{
        const id=req.params.id;
        console.log(id);
        const producto=await Productos.findById(id);
        
        if(producto){
            await Productos.findByIdAndUpdate(id,{ $inc: {visitas:1}});
            return res.status(200).json(producto);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
        
    }
    static getProductosRelacionados = async(req,res)=>{
        const categoria=req.params.categoria;
        const productosrelation=await Productos.find({categoria:categoria});
        if(productosrelation){
            res.status(200).json(productosrelation);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getMenu = async(req,res)=>{
        const categoria=await Categoria.find();
        //console.log(categoria);
        if(categoria){
            const category=[];
            categoria.forEach(element=>{
                category.push({
                    "id":element._id,
                    "titulo":element.nombre,
                    "imagen":element.imagen,
                    "url":element.nombre.toLowerCase().split(' ').join('-')
                });
            })
            return res.status(200).json(category);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static getCategorias = async(req,res)=>{
        const categoria=await Categoria.find();
        if(categoria){
            const category=[];
            categoria.forEach(element=>{
                category.push({
                    "id":element._id,
                    "titulo":element.nombre,
                    "url":element.nombre.toLowerCase().split(' ').join('-')
                });
            })
            return res.status(200).json(category);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static postNewsletterUser = async(req,res)=>{
        const email=req.body.email;
        const comprobante=await UsuarioNewsletter.find({email:email});
        let resps;
        if(comprobante.length > 0){
            resps={
                "res":false,
                "message":"Error usuario se encuentra registrado"
            }
        }else{
            const usuarionewsletter={
                email:email
            }
            let usuarionewsletterModel = new UsuarioNewsletter(usuarionewsletter);
            const respu=usuarionewsletterModel.save();
            resps={
                "res":true,
                "message":"Usuario registrado con exito"
            }
        }

        return res.status(200).json(resps);
    }
    static getRegiones = async(req,res)=>{ 
        const regiones=await Region.find();
        if(regiones){
            res.status(200).json(regiones);
        }else{
            res.status(404).send({errors:["No se encuentra esa Publicacíon"]})
        }

    }

}

module.exports = APIController;