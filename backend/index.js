import 'dotenv/config'
import express, { json } from 'express'
import router from './routes/routes.js'
// import mongoose, { mongo } from 'mongoose'


const app = express();

// setup db
// const mongoString = process.env.DATABASE_URL

// mongoose.connect(mongoString)
// const db = mongoose.connection

// db.on('error', (error)=>{
//     console.log(error)
// })

// db.once('connected', () => {
//     console.log('Database Connected')
// })

app.use(express.json()) // this needs to be the first middleware important
app.use('/api', router) 

app.listen(3000, ()=>{
    console.log("created server")
})
