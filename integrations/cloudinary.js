const cloudinary = require("cloudinary").v2
require("dotenv").config()

cloudinary.config({ 
    cloud_name: 'dw94gbpfs', 
    api_key: '361987894516115', 
    api_secret: 'k3oqdNtBobiJtdOoUjToB956vtA',
});

module.exports = cloudinary;