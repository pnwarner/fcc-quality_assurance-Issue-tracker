const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = '';
let id2 = '';

suite('Functional Tests', function() {

    suite('POST /api/issues/{project} => Object with issue data', function() {
        
        test('Every field filled in', function(done){
            chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Functional Tests - Every field filled in',
                assigned_to: 'Chai and mocha',
                status_text: 'In QA',
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'text');
                assert.equal(res.body.created_by, 'Functional Tests - Every field filled in');
                assert.equal(res.body.assigned_to, 'Chai and mocha');
                assert.equal(res.body.status_text, 'In QA');
                assert.equal(res.body.project, 'test');
                id1 = res.body._id;
                //console.log('Created 1: ' + id1);
                done();
            });
        });

        test('Required fields filled in', function(done) {
            chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Functional Tests - Required fields filled in'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'text');
                assert.equal(res.body.created_by, 'Functional Tests - Required fields filled in');
                assert.equal(res.body.assigned_to, '');
                assert.equal(res.body.status_text, '');
                assert.equal(res.body.project, 'test');
                id2 = res.body._id;
                //console.log('Created 2: ' + id2);
                done();
            });
        });

        test('Missing required fields', function(done) {
            chai.request(server)
            .post('/api/issues/test')
            .send({
                created_by: 'Functional Tests - Missing required fields'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
        });

    });

    suite('PUT /api/issues/{project} => text', function() {
        
        /*
        test('No Body', function(done) {
            chai.request(server)
            .put('/api/issues/test')
            .send({})
            .end((err, res) => {
                //assert.equal(res.body, 'no updated field sent');
                assert.equal(res.body.error, 'could not update');
                done();
            });
        });
        */
        
        test('One field to update', function(done) {
            chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: id1,
                issue_text: 'New Text'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, id1);
                done();
            });
        });
        
        test('Multiple fields to update', function(done) {
            chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: id2,
                issue_title: 'New Title',
                issue_text: 'New Text',
                open: false
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, id2);
                done();
            });
        });

        test('No fields were updated', function(done) {
            chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: id2,
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, id2);
                done();
            });
        });

        test('Missing id', function(done) {
            chai.request(server)
            .put('/api/issues/test')
            .send({
                issue_title: 'New Title',
                issue_text: 'New Text'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
        });

        test('Invalid id', function(done){
            chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: "5871dda29faedc3491ff93bb",
                issue_title: 'New Title',
                issue_text: 'New Text'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not update');
                done();
            });
        });

    });

    suite('GET /api/issues/{project} => Array of objects containing issue data', function() {
        
        test('Get issues', function(done) {
            chai.request(server)
            .get('/api/issues/test')
            .send({})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
        });
        
        test('Filter results with 1 option', function(done){
            chai.request(server)
            .get('/api/issues/test')
            .query({open: false})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.equal(res.body.length, 1);
                done();
            });
        });
        
        test('Filter results with multiple options', function(done){
            chai.request(server)
            .get('/api/issues/test')
            .query({
                open: true,
                created_by: 'Functional Tests - Every field filled in'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.equal(res.body.length, 1);
                done();
            });
        });
        
    });

    suite('DELETE /api/issues/{project} => text', function() {

        test('Successfully Delete First issue', function(done) {
            chai.request(server)
            .delete('/api/issues/test')
            .send({_id: id1})
            .end((err, res) => {
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, id1);
                done();
            });
        });

        test('Successfully Delete Second Issue', function(done) {
            chai.request(server)
            .delete('/api/issues/test')
            .send({_id: id2})
            .end((err, res) => {
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, id2);
                done();
            });
        });

        test('Delete an issue with invalid _id', function(done) {
            chai.request(server)
            .delete('/api/issues/test')
            .send({_id: id1})
            .end((err, res) => {
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, id1);
                done();
            });
        });

        test('Delete an issue with a missing _id', function(done) {
            chai.request(server)
            .delete('/api/issues/test')
            .send({})
            .end((err, res) => {
                assert.equal(res.body.error, 'missing _id');
                done();
            });
        })

    });
  
});
