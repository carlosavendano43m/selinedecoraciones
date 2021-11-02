const path = require('path');
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

      if(file.fieldname=="imgcategory"){
        url='../src/assets/storage/categorias/';
      }
      if(file.fieldname=="imgproducts"){
        url='../src/assets/storage/productos/';
      }
      if(file.fieldname=="portadacatalogo"){
        url='../src/assets/storage/catalogo/';
      }
      if(file.fieldname=="pdfcatalogo"){
        url='../src/assets/storage/catalogo/';
      }
      if(file.fieldname=="imgmarcas"){
        url='../src/assets/storage/marcas/';
      }
      if(file.fieldname=="avatar"){
        url='../src/assets/storage/avatar/';
      }
      
      cb(null, url)
    },
    filename: function (req, file, cb) {
      cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
 })

const upload = multer({ storage: storage })

 module.exports = upload;