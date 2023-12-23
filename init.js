const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
.then((res) => {console.log("Connection successful")})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chatapp');
}


let chats = [
    {
        from: "Anita",
        to: "Devi",
        msg: "Send me code samples",
        created_at: new Date(),
    },
    {
        from: "Sam",
        to: "Mebeline",
        msg: "Coding test soon",
        created_at: new Date(),
    },
    {
        from: "Ashna",
        to: "Dev",
        msg: "Lets learn Python now",
        created_at: new Date(),
    },
    {
        from: "Anna",
        to: "Rahul",
        msg: "Coding competions are near",
        created_at: new Date(),
    },
    {
        from: "Avril",
        to: "Deva",
        msg: "BTS songs are cool",
        created_at: new Date(),
    },
];


Chat.insertMany(chats);
