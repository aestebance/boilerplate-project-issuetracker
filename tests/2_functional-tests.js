const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = "";
let id2 = "";

suite('Functional Tests', function() {
    suite('POST request to /api/issues/{project}', function(){
       test('Create an issue with every field', function(done) {
           chai.request(server)
               .post('/api/issues/test')
               .send({
                   issue_title: 'Title',
                   issue_text: 'text',
                   created_by: 'functional test - every fields filled in',
                   assigned_to: 'Alex',
                   status_text: 'in progress'
               })
               .end(function(error, res){
                   assert.equal(res.status, 200);
                   assert.equal(res.body.issue_title, 'Title');
                   assert.equal(res.body.issue_text, 'text');
                   assert.equal(res.body.created_by, 'functional test - every fields filled in');
                   assert.equal(res.body.assigned_to, 'Alex');
                   assert.equal(res.body.status_text, 'in progress');
                   assert.equal(res.body.open, true);
                   assert.equal(res.body.project, 'test');
                   id1 = res.body._id;
                   console.log("id 1 has been set as " + id1);
                   done();
               });
        });
       test('Create an issue with only required fields', function(done){
           chai.request(server)
               .post('/api/issues/test')
               .send({
                   issue_title: 'Title',
                   issue_text: 'text',
                   created_by: 'functional test - required fields only'
               })
               .end(function(error, res){
                   assert.equal(res.status, 200);
                   assert.equal(res.body.issue_title, 'Title');
                   assert.equal(res.body.issue_text, 'text');
                   assert.equal(res.body.created_by, 'functional test - required fields only');
                   assert.equal(res.body.assigned_to, '');
                   assert.equal(res.body.status_text, '');
                   assert.equal(res.body.open, true);
                   assert.equal(res.body.project, 'test');
                   id2 = res.body._id;
                   console.log("id 2 has been set as " + id2);
                   done();
               });
       });

       test('Create an issue with missing required fields', function(done){
           chai.request(server)
               .post('/api/issues/test')
               .send({
                   created_by: 'functional test - missing required fields'
               })
               .end(function(error, res){
                   assert.equal(res.body.error, 'required field(s) missing');
                   done();
               });
       });
    });

    suite('GET request to /api/issues/{project}', function(){
        test('View issues on a project', function(done){
            chai.request(server)
                .get('/api/issues/test')
                .query({})
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], "issue_title");
                    assert.property(res.body[0], "issue_text");
                    assert.property(res.body[0], "created_on");
                    assert.property(res.body[0], "updated_on");
                    assert.property(res.body[0], "created_by");
                    assert.property(res.body[0], "assigned_to");
                    assert.property(res.body[0], "open");
                    assert.property(res.body[0], "status_text");
                    assert.property(res.body[0], "_id");
                    done();
                });
        });

        test('View issues on a project with one filter', function(done){
            chai.request(server)
                .get('/api/issues/test')
                .query({issue_title: 'Title'})
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], "issue_title");
                    assert.property(res.body[0], "issue_text");
                    assert.property(res.body[0], "created_on");
                    assert.property(res.body[0], "updated_on");
                    assert.property(res.body[0], "created_by");
                    assert.property(res.body[0], "assigned_to");
                    assert.property(res.body[0], "open");
                    assert.property(res.body[0], "status_text");
                    assert.property(res.body[0], "_id");
                    done();
                });
        });

        test('View issues on a project with multiple filters', function(done){
            chai.request(server)
                .get('/api/issues/test')
                .query({
                    _id: id1,
                    issue_text: 'text',
                    open: true
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], "issue_title");
                    assert.property(res.body[0], "issue_text");
                    assert.property(res.body[0], "created_on");
                    assert.property(res.body[0], "updated_on");
                    assert.property(res.body[0], "created_by");
                    assert.property(res.body[0], "assigned_to");
                    assert.property(res.body[0], "open");
                    assert.property(res.body[0], "status_text");
                    assert.property(res.body[0], "_id");
                    done();
                });
        });
    });

    suite('PUT request to /api/issues/{project}',function() {
        test('Update one field on an issue', function(done){
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: id1,
                    issue_title: 'Title2'
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, id1);
                    done();
                });
        });

        test('Update multiple fields on an issue', function(done){
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: id2,
                    issue_title: 'Title3',
                    issue_text: 'text2',
                    open: false
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, id2);
                    done();
                });
        });

        test('Update an issue with missing _id', function(done){
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    issue_title: 'Title4',
                    issue_text: 'text4'
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });

        test('Update an issue with no fields to update', function(done){
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: id1
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'no update field(s) sent');
                    assert.equal(res.body._id, id1);
                    done();
                });
        });

        test('Update an issue with an invalid _id', function(done){
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: '602312bfb26418b05s71e8d2d5',
                    issue_title: 'Title25'
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, '602312bfb26418b05s71e8d2d5');
                    done();
                });
        });
    });

    suite('DELETE request to /api/issues/{project}',function() {
        test('Delete an issue', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({
                    _id: id1
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully deleted');
                    assert.equal(res.body._id, id1);
                    done();
                });
        });

        test('Delete an issue with an invalid _id', function(done){
            chai.request(server)
                .delete('/api/issues/test')
                .send({
                    _id: '602312bfb26418b05s71e8d2d5'
                })
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not delete');
                    assert.equal(res.body._id, '602312bfb26418b05s71e8d2d5');
                    done();
                });
        });

        test('Delete an issue with missing _id', function(done){
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end(function(error, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });
    });
});
