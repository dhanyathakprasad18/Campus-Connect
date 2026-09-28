require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const dns = require("dns");
const Event = require("./models/Event");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

app.use(cors());
app.use(express.json());
dns.setServers(['8.8.8.8']);

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("MongoDB Connected Successfully!");
}).catch((error)=>{
    console.log("MongoDB Connection Error: ",error);
});

const initialEvents = [
  {
    id: 1,
    title: "MERN Stack Workshop",
    category: "Technology",
    date: "25 September 2026",
    time: "10:00 AM",
    location: "Computer Lab 1",
    description:
      "Learn the basics of MongoDB, Express, React, and Node.js through a practical workshop.",
  },
  {
    id: 2,
    title: "College Hackathon",
    category: "Technology",
    date: "28 September 2026",
    time: "9:00 AM",
    location: "Main Auditorium",
    description:
      "Form a team, solve a real problem, and present your solution to mentors.",
  },
  {
    id: 3,
    title: "Photography Club Meet",
    category: "Club",
    date: "30 September 2026",
    time: "2:00 PM",
    location: "Seminar Hall",
    description:
      "Meet fellow photography enthusiasts and learn basic composition techniques.",
  },
];

app.get("/", (req, res)=>{
    res.send("Backend is working")
})

app.get("/api/events", async (req,res)=>{
    const events = await Event.find();
    res.json(events);
})

app.delete("/api/events/:id", async (req,res)=>{
    const deletedEvent = await Event.findByIdAndDelete(
        req.params.id
    )

    if(!deletedEvent){
        return res.status(404).json({
            message: "Event Not Found!"
        })
    }

    res.json({
        message : "Event Deleted Successfully"
    })
})

app.post("/api/events", async(req,res)=>{
    const newEvent = await Event.create(req.body);
    res.json({
        message: "Event Added Successfully!",
        event: newEvent
    });
});

app.put("/api/events/:id",async (req,res)=>{
    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    )

    if(!updatedEvent){
        return res.status(404).json({
            message: "Event Not Found!"
        });
    }

    res.json({
        message:"Event updated succesfully!",
        event: updatedEvent
    });
});

app.post("/api/register", async (req, res) =>{
    const{ name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name, email, password: hashedPassword
    });
    await newUser.save();
    res.json({
        message: "User Registered Successfully!",
        User: newUser
    });
})

app.post("/api/login", async (req, res) =>{
    const{email, password} = req.body;

    const user = await User.findOne({ email });
    if(!user){
        return res.status(404).json({
            message: "Invalid Email or Password"
        });
    }
    const passwordMatch = await bcrypt.compare(
        password, user.password
    )
    if(!passwordMatch){
        return res.status(404).json({
            message: "Invalid Email or Password"
    });
}
res.json({
    message: "Login Successful!",
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
});
});

app.listen(5000, ()=>{
    console.log("Server is running on port 5000");
})