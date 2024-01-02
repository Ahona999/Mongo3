const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const Note = require("./models/note.js");
const methodOverride = require('method-override');
const NoteNotFoundError = require("./NoteNotFoundError.js");

main()
.then((res) => {console.log("Connection successful")})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/notetake');
}

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

//Testing DB//
 
//const newNote = new Note({
//    title: 'My First Note',
//    content: 'This is the content of my first note.'
//});

//newNote.save()
//    .then(note => console.log('Note created:', note))
//    .catch(err => console.error('Error creating note:', err));

//api testing
app.get("/", (req, res) => {
    res.send("Root is working");
});

//INDEX PAGE
app.get("/notes", async (req, res, next) =>{
    let notes = await Note.find();
    console.log(notes);
    res.render("notes.ejs", {notes});
});

//CREATE NOTE PAGE
app.get('/notes/create', async (req, res) => {
    try {
      const note = {}; 
      res.render('createNote.ejs', { note });
    } catch (err) {
      console.error(err);
      res.status(500).render('error.ejs');
    }
  });
   
//POST NOTE ROUTE
app.post('/api/notes', async (req, res) => {
    const { title, content } = req.body;
    const newNote = new Note({ title, content });
    const savedNote = await newNote.save();
    res.redirect("/notes");

    const validationErrors = [];
    if (!title || title.trim().length === 0) {
        validationErrors.push('Title is required');
    } else if (title.length > 50) {
        validationErrors.push('Title must be less than 50 characters');
    }

    if (!content || content.trim().length === 0) {
        validationErrors.push('Content is required');
    } else if (content.length < 10) {
        validationErrors.push('Content must be at least 10 characters');
    }

    if (validationErrors.length) {
        return res.status(400).json({ errors: validationErrors });
    }
});

//GET NOTE ID
app.get("/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        if (!note) {
            throw new NoteNotFoundError();
        }
        res.render("viewnote.ejs", { note }); 
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: "Something went wrong" }); 
    }
});

//EDIT FORM
app.get('/notes/:id/edit', async (req, res) => {
    try {
        const noteData = await Note.findById(req.params.id);
        if (!noteData) {
            return res.status(404).render('error', { error: 'Note not found' });
        }
        res.render('editNote', { noteData });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: "Something went wrong" });
    }
});

//UPDATE ROUTE
app.put('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;
    try {
        const updatedNote = await Note.findByIdAndUpdate(noteId, { title, content }, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.redirect('/notes');
        } catch (err) {
            console.error('Error updating note:', err);
            res.status(500).json({ error: err.message });
        }

        //For validation err
        const validationErrors = [];
        if (!title || title.trim().length === 0) {
            validationErrors.push('Title is required');
        } else if (title.length > 50) {
            validationErrors.push('Title must be less than 50 characters');
        }
    
        if (!content || content.trim().length === 0) {
            validationErrors.push('Content is required');
        } else if (content.length < 10) {
            validationErrors.push('Content must be at least 10 characters');
        }
    
        if (validationErrors.length) {
            return res.status(400).json({ errors: validationErrors });
        }
});

//DESTROY ROUTE
app.delete('/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    try {
        const deletedNote = await Note.findByIdAndDelete(noteId);
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        console.log("note deleted");
        res.redirect("/notes");
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: err.message });
    }
});


//Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.message });
        next();
    } else {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(port, () => {
    console.log(`App is listening on ${port}`);
});