const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let genreSchema = Schema({
  id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
  movies: {
		type: [],
		required: true
	}
});

module.exports = mongoose.model("Genre", genreSchema);
