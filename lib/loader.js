var fs = require('fs')
  , ObjectId = require('mongoose').Types.ObjectId;

var nop = function(){};

function parseLine(text){
  var item = JSON.parse(text);
  function parseItem(content){
    for(var key in content){
      if (content.hasOwnProperty(key)){
        //console.log("key", key, typeof content[key]);
        if(typeof content[key] == 'object' && content[key]["$oid"]){
          content[key]= new ObjectId(content[key]["$oid"]);
        }
        else if(content[key]['$date']){
          content[key] = new Date(content[key]['$date']);
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
      func(line);
      if(ended){
        done();
      }
    }
  }
  lines(input, callback);
}

/*
 * updatePassword - Takes a clear text password and updates the password field.
 * https://github.com/ncb000gt/node.bcrypt.js/
 * @param {String} [password] clear text password to hash
 * @param {Function} callback(err, hashedPassword)
 * @api public
 */


/*
 * load - Load a json file and use it for a perticular model
 * @param {Object} [model] mongoose model to use
 * @param {String} [filename] json file to load
 * @param {Object} [options] optional settings to pass in {remove:true/false, gotdoc:{callback function} }
 * @param {function} done()
 * @api public
 */
function load(/* model, filename, [options,] [done] */){
  var isDone=false;
  var loaded=0;
  var saved=0;
  var errors=[];
  var Model = arguments[0];
  var filename = arguments[1];
  var done, options;
  var optionpos = 1;
  if(typeof(arguments[arguments.length-1])==='function'){
    done = arguments[arguments.length-1];
    optionpos = 2;
  }

  //console.log(typeof arguments.length-optionpos)
  
  if(typeof(arguments[arguments.length-optionpos]) === 'object'){
    options = arguments[arguments.length-optionpos];
  }
  else {
    options={};
  }
  
  
  var remove = typeof options.remove != 'undefined' ? options.remove : true;
  
  var gotdoc = options.gotdoc || nop;
  done = done || nop;
 
  


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
      gotdoc(err, doc);
      saved++;
      gotDone(false);
    }); 
  }
}


exports.load = load;
