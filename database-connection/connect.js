const mongoose = require('mongoose')


const connectToDataBase = async (url) => {
    await mongoose.connect(url)
}


module.exports = connectToDataBase