import mongoose from 'mongoose'


const Model = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    age: {
        required: true,
        type: Number
    }
})


export default Model
