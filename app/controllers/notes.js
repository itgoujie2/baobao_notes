(function(){
	var mongoose = require('mongoose');
	var Note = mongoose.model('Note');
	var Comment = mongoose.model('Comment');

	function allNotes(req, res, next){
		Note.find().sort({createdOn: -1}).exec(function(err, notes){
			if (err){
				return next(err);
			}

			return res.json(notes);
		});
	}

	function saveNotes(req, res, next){
		var note = new Note(req.body);

		note.save(function(err, note){
			if (err){
				return next(err);
			}

			return res.json(note);
		})
	}

	function updateNote(req, res, next){
		var note = req.body;

		Note.findById(note._id, function(err, data){
			data.content = note.content;

			data.save(function(err, result){
				if (err) return next(err);
				if (result) return res.json(result);
			});
		})
	}

	function getNoteById(req, res, next){
		var noteId = req.params.noteId;

		Note.findById(noteId, function(err, note){
			if (err){
				return next(err);
			}

			return res.json(note);
		})
	}

	exports.allNotes = allNotes;
	exports.saveNotes = saveNotes;
	exports.updateNote = updateNote;
	exports.getNoteById = getNoteById;
})()