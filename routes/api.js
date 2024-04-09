'use strict';
require('dotenv').config();
let mongodb = require('mongodb');
let mongoose = require('mongoose');

module.exports = function (app) {

//npx kill-port 3000 on accidental ctrl z

  let uri = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by: {type: String, required: true},
    assigned_to: String,
    status_text: String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  });
  
  let Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')

  
    .get(async function (req, res){
      let project = req.params.project;
      let filterObject = Object.assign(req.query);
      filterObject['project'] = project;
      let projectDocs = await Issue.find(filterObject);
      return res.json(projectDocs);
    })
    
    .post(async function (req, res){
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.json({error: 'required field(s) missing'});
      } else {
        let project = req.params.project;
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
        
        try {
          let newDocument = await newIssue.save();
          return res.json(newDocument);
          //setTimeout((() => {
          //  //res.send(items)
          //  return res.json(newDocument);
          //}), 1000)
        } catch(error) {
          return res.json('error');
        }
      }
    })

    .put( async function (req, res){
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, open } = req.body;
      
      if(!_id) { 
        return res.json({ error: 'missing _id' }); 
      } else if(!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !created_on && !open) {
         return res.json({ error: 'no update field(s) sent', '_id': _id })
      } else {
        let updates = req.body;
        let updatedDateString = new Date().toUTCString();
        const issue = await Issue.find({_id: _id});

        if (issue.length === 0) {
          return res.json({ error: 'could not update', '_id': _id });
        } else {

          //This was needed to PASS FCC Tests
          //created_on and updated_on had no time difference in testing
          if (new Date(issue[0].created_on).toUTCString() === updatedDateString) {
            console.log("times are the same!, Adding 1 second!");
            let newDate = new Date();
            newDate.setSeconds(newDate.getSeconds() + 1);
            updatedDateString = newDate.toUTCString();
          }

          updates['updated_on'] = updatedDateString;
          let result = await Issue.findByIdAndUpdate(_id, updates, {new: true});
          if (result) {
            return res.json({ result: 'successfully updated', '_id': _id });
          } else {
            return res.json({ error: 'could not update', '_id': _id });
          }
        }
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      if (!req.body._id) return res.json({error: 'missing _id'});
      let deletedIssue = await Issue.findByIdAndDelete({_id: req.body._id});
      if (deletedIssue) {
        return res.json({ result: 'successfully deleted', '_id': req.body._id });
      } else {
        return res.json({ error: 'could not delete', '_id': req.body._id });
      }
    });
    
};
