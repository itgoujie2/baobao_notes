var mongoose = require('mongoose');

var CommentSchema = mongoose.Schema({
	content: String, 
	createdOn : {type: Date, index: true, default: Date.now}, 
	parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Note'}
});

mongoose.model('Comment', CommentSchema);