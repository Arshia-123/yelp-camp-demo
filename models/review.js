const mongoose = require(`mongoose`);
//Shortcut
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    //One two many, child-parent relationship 
    author: {
        type: Schema.Types.ObjectId,
        ref: `User`
    }
})

module.exports = mongoose.model(`Review`, reviewSchema);