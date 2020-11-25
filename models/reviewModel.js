const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    rating: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
    full: {
		type: String,
		required: true
	},
    reviewer: {
		type: Object,
		required: true
	},
    movie: {
		type: Object,
		required: true
	}

  //followedUsers: [Schema.Types.ObjectId],
  //followedPeople: [Schema.Types.ObjectId],
  //reviews: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Review", reviewSchema);
