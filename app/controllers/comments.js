(function(){
	var mongoose = require('mongoose');
	var Note = mongoose.model('Note');
	var Comment = mongoose.model('Comment');

	function getComments(req, res, next){
		var noteId = req.query.noteId;
		console.log('noteID: ' + noteId);

		var query = Comment.find({parent: noteId}).sort({createdOn: -1});

		query.exec(function(err, data){
			return res.json(data);
		})
	}

	function saveComments(req, res, next){
		var content = req.body.content;
		var comment = new Comment(req.body);

		comment.save(function(err, comment){
			if (err){
				return next(err);
			}

			return res.json(comment);
		})
	}

	exports.getComments = getComments;
	exports.saveComments = saveComments;
})()