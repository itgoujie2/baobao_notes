var express = require('express');
var app = new express();
var mongoose = require('mongoose');
var db = require('./config/db');
var bodyParser = require('body-parser');

mongoose.connect(db.url);

require('./app/models/Note');
require('./app/models/Comment');
var Note = mongoose.model('Note');
var Comment = mongoose.model('Comment');
var notes = require('./app/controllers/notes');
var comments = require('./app/controllers/comments')


var port = process.env.PORT || 3000;



mongoose.connection.on('open', function(ref){
	console.log('connected: ' + ref);
})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.param('note', function(req, res, next, id){
	console.log('the id: ' + id);
	var query = Note.findById(id);

	query.exec(function(err, note){
		if (err){
			return next(err);
		}
		if (!note){
			return next(new Error('could not find note'));
		}

		req.note = note;

		return next();
	})
});

app.get('/notes', notes.allNotes);
app.get('/notes/:noteId', notes.getNoteById);
app.get('/comments', comments.getComments);
app.post('/notes', notes.saveNotes);
app.post('/notes/update', notes.updateNote);
app.post('/comments', comments.saveComments);

app.listen(port, function(){
	console.log('listening on ' + port);
})