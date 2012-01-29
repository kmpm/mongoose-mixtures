var fs = require('fs')
	, path = require('path');



var template = '{ "name" : "R1", "_id" : { "$oid" : "4f21bb06a8bf63b40c%h" } }\n';
var LINE_COUNT=100000;

function createHuge(filename, done){
	if(path.existsSync(filename)){
		done();
		return;
	}
	var interval = 50000
	var next = interval;
	var drained=true;
	var ws = fs.createWriteStream(filename);
	
	ws.on('open', function(fd){
		var line="";
		var i=0;
		var d1=false;
		var d2=false;
		console.log("creating", filename);
		while(i <= LINE_COUNT){
			
			if(drained){
				line += template.replace('%h', rHex(i));
				d1 = ws.write(line, 'utf-8', fd);
				if(d1 != d2){
					console.log(d1, i, line);
					d2=d1;
				}
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