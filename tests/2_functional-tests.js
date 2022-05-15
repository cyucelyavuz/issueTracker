const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { expect } = require('chai');
const { post } = require('../server');

chai.use(chaiHttp);




suite('Functional Tests', function() {


    suite('ap.post method',()=>{
      let postId;
     
      afterEach(done=>{
        chai.request(server)
            .delete('/api/issues/apitest')
            .type('form')
            .send({
              _id:postId
            })
            .end((err,res)=>{
              if (err) console.log(err);
              else console.log('deletion succes post method suite afterEach');
              done();
            }).timeout(10000);
      })

      test('Create an issue with every field', (done)=>{

          chai.request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
                'issue_title':'PostTest',
                'issue_text':'PostTest1',
                'created_by':'Test Suite Test#1',
                'assigned_to':'Test Suite',
                'status_text':'success PostTest 1'
            })
            .end((err,res)=>{
                postId=res.body._id;
                assert.equal(res.body.assigned_to,'Test Suite');
                assert.equal(res.body.issue_title,'PostTest');
                done();
            }).timeout(10000);
        
      });

    

      test('Create an issue with only required fields',(done)=>{

          chai.request(server)
              .post('/api/issues/apitest')
              .type('form')
              .send({
                'issue_title':'PostTest',
                'issue_text':'PostTest2-Only Required Fields',
                'created_by':'Test Suite Test#2'
              })
              .end((err,res)=>{
                postId=res.body._id;
                assert.equal(res.body.issue_title,'PostTest');
                assert.equal(res.body.issue_text,'PostTest2-Only Required Fields');
                assert.equal(res.body.created_by,'Test Suite Test#2');
                done();
              }).timeout(10000);
       


      })

    

      test('Create an issue with missing required fields',(done)=>{

        chai.request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
              'issue_title':'PostTest',
              'issue_text':'PostTest3-Missing Required Fields'
            })
            .end((err,res)=>{
              assert.equal(res.body.error,'required field(s) missing');
              done();
            }).timeout(10000);
        
      })
  })



    suite('get issue method',()=> {  
      let postId;

      before( (done)=>{
        chai.request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
              'issue_title':'GetTest',
              'issue_text':'Issue for get test',
              'created_by':'get issue method suite before hook',
              'assigned_to':'get issue method suite',
              'status_text':'success'
            })
            .end((err,res)=>{
              if (err) console.log(err);
              else {
                postId=res.body['_id'];
                console.log('issue creation for get issue method suite '+ postId);
            }
              done();
            }).timeout(10000);

        after( done=>{
          chai.request(server)
              .delete('/api/issues/apitest')
              .type('form')
              .send({
                _id:postId
              })
              .end((err,res)=>{
                if (err) console.log(err);
                else console.log('deletion GetTest after get issue method suite');
                done();
              })
        })
      });
      test('View issues on a project',(done)=>{

        chai.request(server)
            .get('/api/issues/apitest')
            .end((err,res)=>{
              assert.equal(typeof res.body, "object");
              const testIssue=res.body.filter(elem=> elem['_id']===postId);
              assert.equal(testIssue[0]['issue_title'],'GetTest');
              done();
         }).timeout(10000);
         
      })

      test('View issues on a project with one filter',(done)=>{

        chai.request(server)
            .get('/api/issues/apitest?issue_text=Issue%20for%20get%20test')
            .end((err,res)=>{
              assert.equal(res.body[0]['issue_title'],'GetTest');
              done();
         }).timeout(10000);
         
      })

      test('View issues on a project with multiple filter',(done)=>{

        chai.request(server)
            .get('/api/issues/apitest?issue_text=Issue%20for%20get%20test&issute_title=GetTest')
            .end((err,res)=>{
              assert.equal(res.body[0]['issue_title'],'GetTest');
              done();
         }).timeout(10000);
         
      })
    });

    suite('app.put method',()=>{
      let putId;
      before( done=>{
        chai.request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
              'issue_title':'PutTest',
              'issue_text':'Issue for put test',
              'created_by':'put issue method suite before hook',
              'assigned_to':'put issue method suite',
              'status_text':'success'
            })
            .end((err,res)=>{
              if (err) console.log(err);
              else {
                console.log('app.put issue creation before hook');
                putId=res.body['_id'];
                done();
              }
            })
      });

      after(done=>{
        chai.request(server)
            .delete('/api/issues/apitest')
            .type('form')
            .send({
              _id:putId
            })
            .end((err,res)=>{
              if (err) console.log(err);
              else {
                console.log('app.put issue deletion after hook');
                done();
              }
            })
      })
      test('Update one field on an issue',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:putId,
              status_text:'modified by put'
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                
                assert.equal(res.body.result,'successfully updated');
                done();
              }
            }).timeout(10000);
          
      })


      test('Update multiple fields on an issue',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:putId,
              status_text:'modified by put',
              assigned_to:'modified by put'
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                
                assert.equal(res.body.result,'successfully updated');
                
                done();
              }
            }).timeout(10000);
          
      })

      test('Update an issue with missing _id',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              status_text:'modified by put'
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                
                assert.equal(res.body['error'],'missing _id');
                done();
              }
            }).timeout(20000);
          
      })

      test('Update an issue with no fields to update',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:putId
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                
                assert.equal(res.body['error'],'no update field(s) sent');
                done();
              }
            });
          
      })


      test('Update an issue with an invalid _id',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:'fuckup ID',
              status_text:'modified by fuck up ID'
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                
                assert.equal(res.body['error'],'could not update');
                done();
              }
            });
          
      })
    })





    suite('app.delete method',()=>{
      let deleteIssueID;

      before( done=>{
        chai.request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
              'issue_title':'DeleteIssue',
              'issue_text':'DeleteIssue',
              'created_by':'before function',
              'assigned_to':'delete method',
              'status_text':'success before func'
            })
            .end((err,res)=>{
              if (err) console.log(err);
              else deleteIssueID=res.body['_id'];
              done();
            }).timeout(10000);
      });

      test('delete an issue', function (done) {


           chai.request(server)
            .delete('/api/issues/apitest')
            .type('form')
            .send({
              _id: deleteIssueID
            })
            .end((err, res) => {

              if (err) console.log(err);
             
              assert.equal(res.body['result'], 'successfully deleted');
              done();
            }).timeout(10000);
          

         
        })
    })


  })

