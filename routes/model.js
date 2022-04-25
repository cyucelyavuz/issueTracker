const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    issue_title: {type:String,required:true},
    issue_text: {type:String,required:true},
    created_on: Date,
    updated_on: Date,
    created_by: String,
    assigned_to: String,
    open: {type:Boolean,default:true},
    status_text: String
  });

  const projectSchema = new mongoose.Schema({
    name: {type:String,required:true},
    issues: [issueSchema]
  });

const Issue= mongoose.model('Issue',issueSchema);
const Project=mongoose.model('Project',projectSchema);

exports.Issue=Issue;
exports.Project=Project;