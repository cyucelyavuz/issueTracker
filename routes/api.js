'use strict';



require('dotenv').config();
const mongoose= require(mongoose);


module.exports = function (app,db) {
 
  

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      //console.log(project);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      console.log(req.body);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
