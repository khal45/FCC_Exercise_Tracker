const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const { Schema } = mongoose
require('dotenv').config()
mongoose.connect(process.env.MONGO_URI)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// when you submit the user it shoould bring the id from the database
// create UserSchema
const UserSchema = new Schema({
  username: String,
});
// create the ExerciseSchema
// const ExerciseSchemaSchema = new Schema({
//   username: String,
// });



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
