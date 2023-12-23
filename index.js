const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require('method-override');
const ExpressError = require("./ExpressError.js");

main()
.then((res) => {console.log("Connection successful")})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chatapp');
}

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

function asyncWrap(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
};

//Index Route
app.get("/chats", async (req, res, next) =>{
    let chats = await Chat.find();
    console.log(chats);
    res.render("chats.ejs", {chats});
});

//New Route
app.get("/chats/new", (req, res) =>{
    res.render("new.ejs");
});

//Create Route
app.post("/chats", (req, res, next) =>{
        let {from, to, msg} = req.body;
        let newChat = new Chat ({
        from: from,
        to: to,
        msg: msg,
        created_at: new Date(),
     });

      newChat.save()
     .then((res) => {console.log("new chat saved in DB")})
     .catch((err) => {console.log(err)});
      res.redirect("/chats");
});

//New Show Route
app.get("/chats/:id", async(req, res, next) =>{
    let {id} = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
        next(new ExpressError(404, "Chat Not found"));
    }
    res.render("edit.ejs", {chat});
})

//Edit Route
app.get("/chats/:id/edit", async (req, res) =>{
        let {id} = req.params;
        let chat = await Chat.findById(id);
        res.render("edit.ejs", {chat});
})

//Update Route
app.put("/chats/:id", async (req, res) =>{
    let {id} = req.params;
    let {msg: newMsg} = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(id, {msg: newMsg}, {runValidators: true, new:true});
    console.log(updatedChat);
    res.redirect("/chats");
});

//Destroy Route
app.delete("/chats/:id", async (req, res) =>{
    let {id} = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
});

app.use((err, req, res, next) => {
    let {status=500, message="Some Error occured"} = err;
    res.status(status).send(message);
})

app.listen(port, () => {
    console.log(`App is listening on ${port}`);
});