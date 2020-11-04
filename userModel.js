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
	}
  //followedUsers: [Schema.Types.ObjectId],
  //followedPeople: [Schema.Types.ObjectId],
  //reviews: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("User", userSchema);
