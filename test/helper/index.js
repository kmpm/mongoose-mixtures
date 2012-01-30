var fs = require('fs')
	, path = require('path');



var template = '{ "name" : "R1", "_id" : { "$oid" : "4f21bb06a8bf63b40c%h" } }\n';
var LINE_COUNT=100000;

function createHuge(filename, done){
	if(path.existsSync(filename)){
		done();
		return;
	}
	var interval = 10000
	var next = interval;
	var drained=false;
	var ws = fs.createWriteStream(filename);
	
	ws.on('open', function(fd){
		var line="";
		var i=0;
		console.log("opened", fd);
		while(i <= LINE_COUNT){
			line += template.replace('%h', rHex(i));
			if(drained){
				ws.write(line, 'utf-8', fd);
				//console.log(drained, line);
				line="";
				if(i>=next){
					console.log(i);
					next += interval;
				}
				i++;	
			}//end if
		}//end while
		ws.end();
	});
	ws.on('close', function(){
		console.log("closed");
		done();
	})
	ws.on('end', function(){
		console.log("ended")
		done();
	});
	ws.on('drain', function(){
		drained=true;
	});
	ws.on('error', function(err){
		console.log('error', err);
	})
	function rHex(i){
		return ("000000000" + i.toString(16)).substr(-6);
	}
	
	
	
	process.nextTick(function(){ 
		
	});
	
}


exports.createHuge=createHuge;