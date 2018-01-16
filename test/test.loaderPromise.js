var assert = require('assert')
  , should = require('should');

var ObjectId = require('mongoose').Types.ObjectId;

var mixtures = require('../index')
  , models = require('./models');

var TEST_FIXTURE=__dirname + '/fixtures/test-ok.json';
var FAILING_TEST_FIXTURE=__dirname + '/fixtures/test-failing.json';
var EMPTY_TEST_FIXTURE=__dirname + '/fixtures/empty.json';


describe('loaderPromise', function(){
  it('should be saved as models', function(){
    var count=0;
    return mixtures.load(models.ParentChild, TEST_FIXTURE, {gotdoc:gotDoc})
    .then(result => {
      count.should.equal(2);
      return models.ParentChild.find({});
    })
    .then((list) => {
      list.should.be.instanceof(Array);
      list.should.have.length(2);
    });

    function gotDoc(err, doc){
      if(err) throw err;
      count++;
    }
  });

  it('load with failing', function(){
    var count=0;
    var ok=0;
    var failed =0;
    return mixtures.load(models.ParentChild, FAILING_TEST_FIXTURE
        , {gotdoc:gotDoc})
    .catch(err => {
      count.should.equal(3);
      ok.should.equal(2);
      failed.should.equal(1);
      should.exist(err);
      err.should.be.an.instanceof(Array);
    });
    
    function gotDoc(err, doc){
      if(err) failed++;
      else ok++;
      count++;
    }  
  });

  it('load without removing', function(){
    /* all should fail since we have them already */
    var count=0;
    var ok=0;
    var failed =0;
    return mixtures.load(models.ParentChild, TEST_FIXTURE
        ,{gotdoc:gotDoc, remove:false})
    .then(() => {
      throw new Error('this should fail');
    })
    .catch(err => {
      count.should.equal(2);
      ok.should.equal(0);
      failed.should.equal(2);
      should.exist(err);
      err.should.be.an.instanceof(Array);
    });
    
    function gotDoc(err, doc){
      if(err) failed++;
      else ok++;
      count++;
      
    }
  });


  it.skip('load from empty file', function(done){
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