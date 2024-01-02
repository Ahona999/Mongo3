class NoteNotFoundError extends Error {
    constructor(note) {
        super();
        this.note = note; 
    }
}

module.exports = NoteNotFoundError;