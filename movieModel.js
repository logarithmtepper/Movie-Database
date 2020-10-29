const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
  id: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	rated: {
		type: String,
	},
  released: {
		type: String,
	},
  runtime: {
		type: String,
	},
  genre: {
		type: String,
	},
  director: {
		type: String,
	},
  writer: {
		type: String,
	},
  actors: {
		type: String,
	},
  plot: {
		type: String,
	},
  language: {
		type: String,
	},
  poster: {
		type: String,
	},
  ratings: {
		type: [{
      source: {type: String},
      value: {type: String}
    }],
	},
  similar: {
		type: [{type: String}],
	}
  //directors: [Schema.Types.ObjectId],
  //writers: [Schema.Types.ObjectId],
  //actors: [Schema.Types.ObjectId],
  //similar: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Movie", movieSchema);
