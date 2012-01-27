var assert = require('assert')
  , should = require('should');

var ObjectId = require('mongoose').Types.ObjectId;

var loader = require('../lib/loader')
  , models = require('./models');

var TEST_FIXTURE=__dirname + '/fixtures/test-ok.json';
var FAILING_TEST_FIXTURE=__dirname + '/fixtures/test-failing.json';

describe('parseLine', function(){
  var line = '{ "name" : "R1", "_id" : { "$oid" : "4f21bb06a8bf63b40c000001" } }'
  var r = loader.parseLine(line);
  it('should return an object', function(){
    r._id.should.be.a('object');
  });

  it('should have all properties', function(){
    r.should.have.property('name', "R1");
    r.should.have.property('_id');
  });

  it('should fix ObjectId', function(){
    r._id.should.be.an.instanceof(ObjectId);
  });
});


describe('loadLines', function(){
  it('should call done after all has been loaded', function(done){
    var count=0;
    loader.loadLines(TEST_FIXTURE, gotItem, gotDone);

    function gotItem(item){
      item.should.be.a('object');
      item.should.have.property('name');
      item.should.have.property('_id');
      count++;
    }

    function gotDone(){
      count.should.equal(2);
      done();
    }
  });
});


describe('loadFixtures', function(){
  it('should be saved as models', function(done){
    var count=0;
    loader.loadFixtures(models.ParentChild, TEST_FIXTURE, gotDoc, gotDone);

    function gotDoc(err, doc){
      if(err) throw err;
      count++;
    }

    function gotDone(){
      count.should.equal(2);
      done();
    }
  });

  it('load with failing', function(done){
    var count=0;
    var ok=0;
    var failed =0;
    loader.loadFixtures(models.ParentChild, FAILING_TEST_FIXTURE
        , gotDoc, gotDone);
    
    function gotDoc(err, doc){
      if(err) failed++;
      else ok++;
      count++;
      
    }
    function gotDone(err){
      count.should.equal(3);
      ok.should.equal(2);
      failed.should.equal(1);
      should.exist(err);
      err.should.be.an.instanceof(Array);
      done();
    }
  });

  it('load without removing', function(done){
    /* all should fail since we have them already */
    var count=0;
    var ok=0;
    var failed =0;
    loader.loadFixtures(models.ParentChild, TEST_FIXTURE
        , gotDoc, gotDone, {remove:false});
    
    function gotDoc(err, doc){
      if(err) failed++;
      else ok++;
      count++;
      
    }
    function gotDone(err){
      count.should.equal(2);
      ok.should.equal(0);
      failed.should.equal(2);
      should.exist(err);
      err.should.be.an.instanceof(Array);
      done();
    }
  });


});