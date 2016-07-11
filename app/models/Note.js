var mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
	title: String, 
	content: String, 
	createdOn : {type: Date, index: true, default: Date.now}
});

mongoose.model('Note', NoteSchema);