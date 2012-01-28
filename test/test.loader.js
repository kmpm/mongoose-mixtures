var assert = require('assert')
  , should = require('should');

var ObjectId = require('mongoose').Types.ObjectId;

var mixtures = require('../index')
  , models = require('./models');

var TEST_FIXTURE=__dirname + '/fixtures/test-ok.json';
var FAILING_TEST_FIXTURE=__dirname + '/fixtures/test-failing.json';
var EMPTY_TEST_FIXTURE=__dirname + '/fixtures/empty.json';


describe('load', function(){
  it('should be saved as models', function(done){
    var count=0;
    mixtures.load(models.ParentChild, TEST_FIXTURE, gotDoc, gotDone);

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
    mixtures.load(models.ParentChild, FAILING_TEST_FIXTURE
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
    mixtures.load(models.ParentChild, TEST_FIXTURE
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


  it('load from empty file', function(done){
    /* all should fail since we have them already */
    var count=0;
    var ok=0;
    var failed =0;
    mixtures.load(models.ParentChild, EMPTY_TEST_FIXTURE
        , gotDoc, gotDone);
    
    function gotDoc(err, doc){
      if(err) failed++;
      else ok++;
      count++;
      
    }
    function gotDone(err){
      console.log("gotDone");
      count.should.equal(0);
      ok.should.equal(0);
      failed.should.equal(0);
      should.not.exist(err);
      done();
    }
  });


});