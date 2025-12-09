const ToDoListModel = require("../models/ToDoListModel");
const ProfileModel = require("../models/ProfileModel");

exports.CreateToDo = (req, res) => {
    req.body.UserName = req.headers.UserName
    ToDoListModel.create(req.body)
        .then((data) => res.status(200).json({
            status: 'Success',
            data: data,
        }))
        .catch((error) => res.status(400).json({
            status: 'Fail',
            data: error,
        }));
}

exports.ListToDo = (req, res) => {
    ToDoListModel.find({ UserName: req.headers.UserName })
        .then((ToDoList) => res.status(200).json({
            status: 'success',
            data: ToDoList
        }))
        .catch((error) => res.status(400).send({
            status: 'fail',
            data: error
        }));
}

exports.UpdateToDo = (req, res) => {

    const updateToDo = {
        ToDoSubject: req.body.ToDoSubject,
        ToDoDescription: req.body.ToDoDescription,
        UpdateDate: Date.now()
    };

    ToDoListModel.updateOne({ _id: req.body._id}, {$set: updateToDo }, {upsert: true})      // upset true means, if id dont match it create a new ToDo
        .then((result) => {
            if (result.modifiedCount>0) {
                res.status(200).json({
                    status: 'success',
                    data: result,
                })
            }
            else {
                res.status(404).json({
                    status: 'fail',
                    data: "No change made"
                })
            }
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error',
                data: err
            })
        })
}

exports.UpdateStatus = (req, res) => {
    updateStatus = {
        ToDoStatus: req.body.Status,
        UpdateDate: Date.now()
    }

    ToDoListModel.updateOne({_id: req.body._id}, {$set: updateStatus}, {upsert: true})
    .then((data) => {
        res.status(200).json({
            status: 'success',
            data: data
        })
    })
    .catch((err) => {
        res.status(400).json({
            status: 'fail',
            data: err
        })
    })
}

exports.RemoveToDo = (req, res) => {
    ToDoListModel.deleteOne({_id: req.body._id})
    .then((data) => {
        res.status(200).json({
            status: 'success',
            data: data
        })
    })
    .catch((err) => {
        res.status(400).json({
            status: 'fail',
            data: err
        })
    })
}

exports.SelectToDoByStatus = (req, res) => {
    ToDoListModel.find({ UserName: req.headers.UserName, ToDoStatus: req.body.ToDoStatus })
        .then((ToDoList) => res.status(200).json({
            status: 'success',
            data: ToDoList
        }))
        .catch((error) => res.status(400).send({
            status: 'fail',
            data: error
        }));
}

exports.SelectToDoByDate = (req, res) => {
    let FromDate = req.body["FromDate"];
    let ToDate = req.body["ToDate"];

    let toDateObj = new Date(ToDate);
    toDateObj.setDate(toDateObj.getDate()+1)   // add 1 day

    const FilterQuery = {
        UserName: req.headers.UserName,
        CreateDate: {
            $gte: new Date(FromDate),
            $lt: toDateObj    //ToDate-23:59:59
        }
    }
    ToDoListModel.find(FilterQuery)
        .then((ToDoList) => res.status(200).json({
            status: 'success',
            data: ToDoList
        }))
        .catch((error) => res.status(400).send({
            status: 'fail',
            data: error
        }));
}