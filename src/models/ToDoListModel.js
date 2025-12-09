const mongoose= require('mongoose');
const ToDoSchema = mongoose.Schema({
    UserName: {type: String, required: true},
    ToDoSubject: {type: String, required: true},
    ToDoDescription: {type: String},
    ToDoStatus: {type: String, default: "New"},
    CreateDate: {type: Date, default: Date.now},
    UpdateDate: {type: Date, default: Date.now}
}, {versionKey: false});        // UserName ToDoSubject ToDoDescription ToDoStatus CreateDate UpdateDate

const ToDoModel = mongoose.model("List", ToDoSchema);
module.exports = ToDoModel;