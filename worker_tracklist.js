//Worker thread for receiving DS Tracklist

self.addEventListener('message', function(e) {

	console.log("e: " , e);

	importScripts('./receive_ds_data.js');
	importScripts('./class_reference_points.js');
	importScripts('./sleep.js');


	//delays this worker to reduce http requests and make application resposive
	sleep(e.data.workerdelay);

	var aTrackList 	= Receive_DS_data( e.data.dsurl, e.data.dsport , e.data.timeout , e.data.receivemode);
	console.log("DS Tracklist complete array: " , aTrackList);


	var aRefPointTMP         =      new Refpoint();
	var k = 0;
	var rpexists = "no";
	var commenttmp = '';
	var tmpObj;
	var aNewTrackList = new Array();
	
	if (aTrackList.length != 0){
		for (var key in aTrackList ){
	
			tmpObject = aRefPointTMP[key];
			commenttmp = '';
		
			if (aRefPointTMP[key]){rpexists="yes"}else{rpexists="no"};
			// check if track is in local tracklist array and if comment field exists
			if (key in aRefPointTMP){
				if ( 'Comment' in tmpObject ) {
					commenttmp = tmpObject["Comment"];
				};
			};
	
			aNewTrackList[k] = {    trackid:key
                                                ,trackname:aTrackList[key]
                                                ,refpoint:rpexists
                                                ,comment:commenttmp
                                            };
 
			k++;
		}
	}else{
		for (var key in aRefPointTMP ){
		
			tmpObject = aRefPointTMP[key];	
			// check if comment field exists in an array
			commenttmp = '';
			if ( 'Comment' in tmpObject ) {
                                        commenttmp = tmpObject["Comment"];
                        };
			
			aNewTrackList[k] = {    trackid:key
                                                ,trackname:aRefPointTMP[key].Name
                                                ,refpoint:rpexists
                                                ,comment:commenttmp
                                            };
	
			k++;
		}
	}

	// return an arry of hashes with info for each track	
	self.postMessage(aNewTrackList);

}, false);