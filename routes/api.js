'use strict';
let mongodb = require('mongodb');
let mongoose = require('mongoose');

module.exports = function (app) {

    mongoose.set('useFindAndModify', false);
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    let issueSchema = new mongoose.Schema({
        issue_title: {
            type: String,
            required: true
        },
        issue_text: {
            type: String,
            required: true
        },
        created_by: {
            type: String,
            required: true
        },
        assigned_to: {
            type: String
        },
        status_text: {
            type: String
        },
        open: {
            type: Boolean
        },
        created_on: {
            type: Date
        },
        updated_on: {
            type: Date
        },
        project: {
            type: String
        }
    });

    let Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project;
      let filter = { project: project };
      Object.keys(req.query).forEach((key) => {
          if (req.query[key] != '') {
              filter[key] = req.query[key];
          }
      });
      Issue.find(filter, (error, results) => {
          if (!error && results) {
              return res.json(results);
          }
      });
    })

    .post(function (req, res){
      let project = req.params.project;
        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
            return res.json({
                error: 'required field(s) missing'
            });
        }

      let newIssue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          open: true,
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
          project: project
      });
      newIssue.save((error, savedIssue) => {
          if (!error && savedIssue) {
              return res.json(savedIssue);
          }
      });
    })

    .put(function (req, res){
      let project = req.params.project;
      let updatedIssue = {
          issue_title: "",
          issue_text: "",
          created_by: "",
          assigned_to: "",
          status_text: "",
          open: true,
      };
      if (!req.body._id) {
          return res.json({
              error: 'missing _id'
          });
      }
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] != '') {
            updatedIssue[key] = req.body[key];
        }
      });

      if (Object.keys(req.body).length < 2) {
          return res.json({
              error: 'no update field(s) sent',
              _id: req.body._id
          });
      }
      updatedIssue['project'] = project;
      let newDate = new Date();
      newDate.setDate(newDate.getDate() + 1);
      updatedIssue['updated_on'] = newDate.toUTCString();
      Issue.findByIdAndUpdate(
          req.body._id,
          updatedIssue,
          {new: true},
          (error, updatedIssue) => {
              if (!error && updatedIssue) {
                  return res.json({
                      result: 'successfully updated',
                      _id: req.body._id
                  });
              } else {
                  return res.json({
                      error: 'could not update',
                      _id: req.body._id
                  });
              }
          });
    })

    .delete(function (req, res){
      let project = req.params.project;
      if (!req.body._id) {
          return res.json({
              error: 'missing _id'
          });
      }

      Issue.findByIdAndRemove(
          req.body._id,
          (error, deletedIssue) => {
              if (!error && deletedIssue) {
                  return res.json({
                      result: 'successfully deleted',
                      _id: req.body._id
                  });
              } else {
                  return res.json({
                      error: 'could not delete',
                      _id: req.body._id
                  });
              }
          });
    });
};
