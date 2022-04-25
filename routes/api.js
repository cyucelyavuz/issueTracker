'use strict';

require('dotenv').config();
const { is } = require('express/lib/request');
const { createInvalidArgumentValueError } = require('mocha/lib/errors');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const Issue=require('./model').Issue;
const Project=require('./model').Project;


module.exports = function (app) {
 
  main().catch(err => console.log(err));

  async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to MongoDB');


}
  

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      //console.log(project);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      }=req.body;

      if(!issue_title||!issue_text||!created_by){
        res.json({error:'required filed(s) missing'});
        return;
      }
      const issue = new Issue({
        issue_title:issue_title,
        issue_text:issue_text,
        created_on:new Date(),
        updated_on:new Date(),
        created_by:created_by,
        assigned_to:assigned_to,
        open:true,
        status_text:status_text
      });
      Project.findOne({name:project},(err,foundProject)=>{
        if(!foundProject){
          const newProject= new Project({name:project});
          newProject.issues.push(issue);
          newProject.save((err,data)=>{
            if(err) res.send('there was an error saving in post');
            else res.json(issue);
          })
          
        }
        else {
          foundProject.issues.push(issue);
          foundProject.save((err,data)=>{
            if(err) res.send('there was an error saving in post');
            else res.json(issue);
          })
        }
      });
      


 


    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
