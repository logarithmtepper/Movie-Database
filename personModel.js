const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let personSchema = Schema({
  id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
  works: {
		type: [{type: String}],
		required: true
	},
  collaborators: {
		type: [{type: String}],
	}
  //works: [Schema.Types.ObjectId],
  //collaborators: [Schema.Types.ObjectId],
});

module.exports = mongoose.model("Person", personSchema);
