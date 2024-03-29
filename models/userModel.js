const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
  username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email:
	{
		type: String,
		required: true
	},
  contributing: {
		type: String,
		required: true
	},
  followedUsers: {
		type: [],
	},
  followedPeople: {
		type: [],
	},
  reviews: {
		type: [],
	},
  recommended: {
		type: [],
  },
	follower:{
		type:[],
		required: true
	}
});

module.exports = mongoose.model("User", userSchema);
