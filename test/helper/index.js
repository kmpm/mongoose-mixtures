var fs = require('fs')
	, path = require('path');



var template = '{ "name" : "R1", "_id" : { "$oid" : "4f21bb06a8bf63b40c%h" } }\n';
var LINE_COUNT=100000;

function createHuge(filename, done){
	if(path.existsSync(filename)){
		
	}
	var interval = 1000
	var next = interval;
	var i=0
	var drained=true;
	var ws = fs.createWriteStream(filename);
	ws.on('close', function(){
		done();
	})
	ws.on('end', function(){
		done();
	});
	ws.on('drain', function(){
		drained=true;
	});
	function rHex(i){
		return ("000000000" + i.toString(16)).substr(-6);
	}
	
	
	var line="";
	process.nextTick(function(){ 
		while(i <= LINE_COUNT){
			line += template.replace('%h', rHex(i));
			
			if(drained){
				ws.write(line);
				//console.log(drained, line);
				line="";
				if(i>=next){
					console.log(i);
					next += interval;
				}
				i++;
			}

		}
	});
	
}


exports.createHuge=createHuge;