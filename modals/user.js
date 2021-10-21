const mongoose = require('mongoose');
const Schema = mongoose.Schema;
userSchema = Schema({
    _id:String,
    username: {
        type: String,
        required: true,
    },
});
const User = new mongoose.model('User', userSchema);

module.exports.User = User;
messageSchema = Schema({
    message: String,
    room:String,
    from: {
        type: String,
        ref: User,
    },
})
module.exports.UserMessage = new mongoose.model('UserMessage', messageSchema);