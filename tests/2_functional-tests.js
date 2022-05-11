const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { expect } = require('chai');

chai.use(chaiHttp);
let test1Id;
let test2Id;
suite('Functional Tests', function() {
  suite('ap.post method',()=>{
      test('Create an issue with every field', (done)=>{

          chai.request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
                'issue_title':'PostTest',
                'issue_text':'PostTest1',
                'created_by':'Test Suite Test#1',
                'assigned_to':'Test Suite',
                'status_test':'success PostTest 1'
            })
            .end((err,res)=>{
                test1Id=res.body._id;
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
                test2Id=res.body._id;
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
              assert.equal(res.body.error,'required filed(s) missing');
              done();
            }).timeout(10000);
        
      })
  })
    suite('get issue method',()=> {  

      test('View issues on a project',(done)=>{

        chai.request(server)
            .get('/api/issues/apitest')
            .end((err,res)=>{
              assert.equal(typeof res.body, "object");
              //const testIssues=res.body.filter(elem=> elem['issue_title']='PostTest');
              //console.log(testIssues);
              //assert.equal(testIssues.length,3);
              done();
         }).timeout(10000);
         
      })

      test('View issues on a project with one filter',(done)=>{

        chai.request(server)
            .get('/api/issues/apitest?issue_text=PostTest2-Only%20Required%20Fields')
            .end((err,res)=>{
              assert.equal(res.body[0].issue_title,'PostTest');
              done();
         }).timeout(10000);
         
      })

      test('View issues on a project with multiple filter',(done)=>{

        chai.request(server)
            .get('/api/issues/apitest?issue_text=PostTest2-Only%20Required%20Fields&issute_title=PostTest')
            .end((err,res)=>{
              console.log(res.body);
              assert.equal(res.body[0].issue_title,'PostTest');
              done();
         }).timeout(10000);
         
      })

    suite('app.put method',()=>{

      test('Update one field on an issue',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:test2Id,
              status_text:'modified by put'
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                //console.log(res.body);
                assert.equal(res.body['status_text'],'modified by put');
              }
            }).timeout(20000);
          done();
      })


      test('Update multiple fields on an issue',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:test1Id,
              status_text:'modified by put',
              assigned_to:'modified by put'
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                //console.log(res.body);
                assert.equal(res.body['status_text'],'modified by put');
                assert.equal(res.body['assigned_to'],'modified by put');
              }
            }).timeout(20000);
          done();
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
               
              }
            }).timeout(20000);
          done();
      })

      test('Update an issue with no fields to update',(done)=>{
        chai.request(server)
            .put('/api/issues/apitest')
            .type('form')
            .send({
              _id:test1Id
            })
            .end((err,res)=>{
              if(err) console.log(err);
              else {
                
                assert.equal(res.body['error'],'no update field(s)');
               
              }
            }).timeout(20000);
          done();
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
                
                assert.equal(res.body['error'],'no issue by that id');
               
              }
            }).timeout(20000);
          done();
      })
    })





    suite('app.delete method',()=>{

      test('delete an issue',(done)=>{
       
     
      chai.request(server)
            .delete('/api/issues/apitest')
            .type('form')
            .send({
              _id:test1Id
            })
           .end((err,res)=>{
             
             if (err) console.log(err); 
            assert.equal(res.body['result'],'success on delete');

            }).timeout(100000);
      chai.request(server)
          .delete('/api/issues/apitest')
          .type('form')
          .send({
           _id:test2Id
           })
          .end((err,res)=>{
             if (err) console.log(err);
             
             assert.equal(res.body['result'],'success on delete');
             
           }).timeout(100000);
      
          done();
      })
    })
  })
});
