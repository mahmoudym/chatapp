let mongoose = require('mongoose');
let GroupSchema = new mongoose.Schema({
	name: {
		type: String,
    unique: true,
		required: true,
		trim: true
	},
	members: [String]

});
let Group = mongoose.model('Group', GroupSchema);
module.exports = Group;
