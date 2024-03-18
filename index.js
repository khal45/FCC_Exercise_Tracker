const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const { Schema } = mongoose
require('dotenv').config()
mongoose.connect(process.env.MONGO_URI)

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// when you submit the user it shoould bring the id from the database
// create UserSchema
const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);
// create the ExerciseSchema
const ExerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});

// model the schema
const Exercise = mongoose.model("Exercise", ExerciseSchema);

// get request to get the users
app.get('/api/users', (req, res) => {
  (async () => {
    const users = await User.find({}).select("_id username")
    if (!users) {
      res.send("no users")
    } else {
      res.json(users)
    }
  })();
})
// create a post request to save the user
app.post('/api/users', (req, res) => {
  (async () => {
    // save user to db
    try {
      const userObj = new User({
        username: req.body.username
      });
      const result = await userObj.save();
      console.log(result);
      // filter the __v from the returned object
      res.json(result)
    }
    catch {
      console.log(error);
    }
  })();
  // console.log(req.body);
  // res.json({ greeting: "Hello api" });
})

// create a post request to save the exercise

app.post('/api/users/:_id/exercises', (req, res) => {
  // save data to database
  (async () => {
    try {
      const id = req.params._id
      const { description, duration, date } = req.body
      // grap the user
      const user = await User.findById(id)
      // if user doesn't exist
      if (!user) {
        res.send("could not find user")
      } else {
        const exerciseObj = new Exercise({
          user_id: user._id,
          description,
          duration,
          date: date ? new Date(date) : new Date()
        })
        const exercise = await exerciseObj.save();
        console.log(exercise);
        // console.log(new Date(exercise.date).toDateString())
        res.json({
          _id: user._id,
          usename: user.username,
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString()
          // date: new Date(exercise.date).toDateString
        })
      }
    } catch (error) {
      console.log(error);
    }
  })();
})

app.get('/api/users/:_id/logs', (req, res) => {
  (async () => {
    const { from, to, limit } = req.query;
    const id = req.params._id;
    const user = await User.findById(id);
    // if no user
    if (!user) {
      res.send("Could not find user")
      return;
    } else {
      // create date object
      let dateObj = {}
      if (from) {
        dateObj["$gte"] = new Date(from)
      }
      if (to) {
        dateObj["$lte"] = new Date(to)
      }
      let filter = {
        user_id: id
      }
      if (from || to) {
        filter.date = dateObj;
      }

      const exercises = await Exercise.find(filter).limit(+limit ?? 500)
      const log = exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))
      res.json({
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log
      })
    }
  })();
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
