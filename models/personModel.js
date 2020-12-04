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
		type: [],
		required: true
	},
  collaborators: {
		type: [],
	},
	follower:{
		type:[]
	}
});

module.exports = mongoose.model("Person", personSchema);
