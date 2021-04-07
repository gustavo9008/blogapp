
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let user = new Schema({
  name: { type: String },
  username: { type: String },
  password: { type: String },
  profile: { type: Schema.Types.ObjectId, required: true, ref: "profile" },
}); 