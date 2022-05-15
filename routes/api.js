'use strict';

require('dotenv').config();
const { serializeWithBufferAndIndex } = require('bson');
const { is } = require('express/lib/request');
const { createInvalidArgumentValueError } = require('mocha/lib/errors');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
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
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.query;
      let open=req.query.open;

      (open!=undefined) ?
        (open==='true') ? open=true : open=false
        : open=undefined;
      
      
      
      Project.aggregate([
        {
          $match: { name:project }
        },
        {
          $unwind: '$issues'
        },
       _id!=undefined 
       ? { $match:{'issues._id': ObjectId(_id)}} 
       : { $match:{}},
       open!=undefined
       ? { $match:{'issues.open':open}}
       : { $match:{}},
       issue_title!=undefined
       ? { $match:{'issues.issue_title':issue_title}}
       : { $match:{}},
       issue_text!=undefined
       ? { $match:{'issues.issue_text':issue_text}}
       : { $match:{}},
       created_by!=undefined
       ? { $match:{'issues.created_by':created_by }}
       : { $match:{}},
       assigned_to!=undefined
       ? { $match:{'issues.assigned_to':assigned_to}}
       : { $match:{}},
       status_text!=undefined
       ? { $match:{'issues.status_text':status_text}}
       : { $match:{}}
      ]).exec((err,data)=>{
       
        if (!data) res.json([])
        else if (err) res.json({error:err.message})
        else {
          let response=data.map( elem=> elem.issues);
          res.json(response);
        }
      });
      
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
      console.log('create issue'+ '\n'+ req.body+' '+project);
      if(!issue_title||!issue_text||!created_by){
        res.json({ error: 'required field(s) missing' });
        return;
      }
      const issue = new Issue({
        issue_title:issue_title,
        issue_text:issue_text,
        created_on:new Date(),
        updated_on:new Date(),
        created_by:created_by,
        assigned_to:assigned_to || '',
        open:true,
        status_text:status_text || ''
      });
      Project.findOne({name:project},(err,foundProject)=>{
        if(!foundProject){
          const newProject= new Project({name:project});
          newProject.issues.push(issue);
          newProject.save((err,data)=>{
            if(err) res.send('there was an error saving in post');
           
            else {
              const responsObj = data.issues.filter(elem=> elem.created_on===issue.created_on);
              //console.log(responsObj);
              res.json(responsObj[0]);
            }
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
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      }= req.body;

      if(!_id){
        res.json({error:'missing _id'});
        return;
      }
      
      if(!issue_title && 
         !issue_text &&
         !created_by &&
         !assigned_to &&
         !status_text &&
         !open) {
           res.json({ error: 'no update field(s) sent', '_id': _id });
           return;
         }
      Project.findOne({name:project},(err,projData)=>{
        if (err || !projData) res.json({ error: 'could not update', '_id': _id });
        else {
          const issueToUpdate= projData.issues.id(_id);
          if(!issueToUpdate) {
            res.json({ error: 'could not update', '_id': _id });
            return;
          }
          issueToUpdate.issue_title=issue_title||issueToUpdate.issue_title;
          issueToUpdate.issue_text=issue_text||issueToUpdate.issue_text;
          issueToUpdate.created_by=created_by||issueToUpdate.created_by;
          issueToUpdate.assigned_to=assigned_to||issueToUpdate.assigned_to;
          issueToUpdate.updated_on= new Date();
          issueToUpdate.open=open;
          issueToUpdate.status_text=status_text||issueToUpdate.status_text;
          projData.save((err,data)=>{
            if (err|| !data){
              res.json({ error: 'could not update', '_id': _id })
            }
            //{  result: 'successfully updated', '_id': _id }
            else res.json({ result: 'successfully updated', '_id': _id})
            //res.json(data['issues'].id(_id));
          })
        }

      })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const _id=req.body._id;
      console.log('delete issue \n'+req.body )
      if(!_id) {
        res.json({ error: 'missing _id' });
        return;
      } else{
        
        Project.findOne({name:project},(err,data)=>{
          if(err||!data) res.json({ error: 'could not delete', '_id': _id });
          else {
            const issueToDel = data.issues.id(_id);
            console.log('issue to del= \n'+issueToDel);
            if(!issueToDel){
              console.log('error cause of bad Id');
              res.send({ error: 'could not delete', '_id': _id });
              return;
            }
            issueToDel.remove();

            data.save((err,data)=>{
              if(err|!data) res.json({ error: 'could not delete', '_id': _id });

              else {
                
                res.json({ result: 'successfully deleted', '_id': _id });
              }
            })
          }
        })
      }
    });
    
};
