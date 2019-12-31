
var Schema = require('mongoose').Schema;



var ParentChild = new Schema({
    name    : {type: String, required:true, unique:true}
  , parent  : {type: Schema.ObjectId, index:true}
});


function Models(){
  this.mongoose = require('mongoose');
  this.database = global.process.env.TEST_DB || "mongodb://localhost/test-mixtures"
  this.mongoose.connect(this.database, {useNewUrlParser: true, useUnifiedTopology: true});
}

Models.prototype.__defineGetter__('ParentChild', function(){
  return this.mongoose.model('ParentChild', ParentChild);
});



module.exports = new Models();