const sharp = require('sharp');

exports.helperImg = (filePath,filename,size = 300) => {
    return sharp(filePath).resize(size).toFile(`../src/assets/storage/productos/${filename}`)
}
