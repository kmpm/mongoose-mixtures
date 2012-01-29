var fs = require('fs')
  , ObjectId = require('mongoose').Types.ObjectId;

function parseLine(text){
  var item = JSON.parse(text);
  function parseItem(content){
    for(var key in content){
      if (content.hasOwnProperty(key)){
        //console.log("key", key, typeof content[key]);
        if(typeof content[key] == 'object' && content[key]["$oid"]){
          content[key]= new ObjectId(content[key]["$oid"]);
        }
        else if(typeof content[key] == 'object'){
          content[key] = parseItem(content[key]);
        }
        //do nothing
      }
    }
    return content;
  }
  return parseItem(item);

}

function loadLines(filename, callback, done){
  var input = fs.createReadStream(filename);
  var ended = false;
  function lines(input, func){
    var remaining='';
    input.on('data', function(data){
      remaining += data;
      var index = remaining.indexOf('\n');
      while(index > -1){
        var line = remaining.substring(0, index);
        remaining = remaining.substring(index+1);
        passOn(parseLine(line));
        index=remaining.indexOf('\n');
      }
    });

    input.on('end', function(){
      //console.log("end", filename, remaining.length);
      ended=true;
      if(remaining.length >0){
        passOn(parseLine(remaining));
      }
      else{
        //console.log("just end", filename, done);
        done();
      }
    });

    function passOn(line){
      process.nextTick(function(){
        func(line);
        if(ended){
          done();
        }
      });//nextTick
    }//passOn
  }
  lines(input, callback);
}


/*
  options = {remove:true}
*/
function load(Model, filename, callback, done){
  var isDone=false;
  var loaded=0;
  var saved=0;
  var errors=[];
  var options = arguments.length<=4 ? {} :  arguments[4]
  var remove = typeof options.remove != 'undefined' ? options.remove : true;
  
  if(remove){
    //clean up the database
    Model.remove(function(){
      //get the objects
      startWork();
    });
  }
  else {
    startWork();
  }

  function startWork(){
    loadLines(filename, worker, gotDone); 
  }

  function gotDone(){
    //if called without arguments i.e. done fromLoadLines
    if(arguments.length==0)
      isDone=true;
    if(isDone && saved===loaded){
      if(errors.length>0){
        done(errors);
      }
      else{
        done();
      }
    }
  }

  //do the work
  function worker(data){
    loaded++;
    var document = new Model(data);
    document.save(function(err, doc){
      if(err){
        errors.push(err);
      }
      callback(err, doc);
      saved++;
      gotDone(false);
    }); 
  }
}


exports.load = load;
