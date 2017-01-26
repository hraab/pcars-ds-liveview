// Module for recaive data from ProjectCARS dedicated server
// requirements:    JQUERY  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>

//Receive_DS_data("[DS URL]]",9000);
// http://[DS URL]:9000/api/session/status?attributes&members&participants
function Receive_DS_data (url,port,timeout,receivemode, aRefPointTMP){

	this.url			=	url;
	this.port			=	port;
	this.fullurl		=	'http://' +  url + ':' + port;
	this.timeout		=	timeout;
	this.receivemode	=	receivemode;		// GETDRIVERDATE , GETTRACKLIST
	this.aRefPointTMP	=	aRefPointTMP;		// hash off all available RefPoints
	
	//CurrentSector has to be mapped
	// API Sector 	- Real Sector
	// 	3 			- 	1
	// 	1 			- 	2
	// 	2 			- 	3
	//	0			-	0
	//this.aSectormapping = {};
	this.aSectormapping = {
				"3": '1',
				"1": '2',
				"2": '3',
				"0": '0'
	};
	
	

	//if(log >= 3){console.log("Receive_DS_data() --- receivemode: " , receivemode);}

	if (this.receivevariant == undefined){
		this.receivevariant = "GETDRIVERDATE";
	}

	// todo: Mapping HASH fuer receivevariant festlegen
	var aReceiveModes = {
				 "GETDRIVERDATE" 	: "/api/session/status?attributes&members&participants"
				,"GETDSDATA"	 	: "/api/session/status?attributes&members&participants"
				,"GETDSANDDRIVERDATA"	: "/api/session/status?attributes&members&participants"
				,"GETTRACKLIST"  	: "/api/list/tracks"
				,"GETVEHICLELIST"  	: "/api/list/vehicles"
				,"GETCRESTDRIVERDATA"	: "/crest/v1/api?gameStates=true&participants=true&eventInformation=true"
				,"GETCREST2DRIVERDATA"	: "/crest2/v1/api?gameStates=true&participants=true&eventInformation=true"
				,"GETDEMODATA"    : ""
			};	

//todo: Decison Using XMLHTTP class oder   THREE
//      http://api.jquery.com/jquery.getjson/
//	jQuery.getJSON( this.fullurl, 
//    			function(data){
//				if(log >= 3){console.log( data );}
//				document.write ( data );
//		});
//	wait(3);
//	document.write ( data );
	
	var aDrivers		=	new Array();
	aDrivers.globals = {
		"joinable":		"default parameters"
		,"lobbyid":		"default parameters"
		,"max_member_count":	"default parameters"
		,"now":			"default parameters"
		,"state":		"default parameters"
		,"attributes":{
			"TrackId":      9999999999
			,"SessionStage":""
			,"SessionState":""
		}
	}
	aDrivers.driverlist	=	new Array();
	
	var aEmptyArray		=	new Array();
	var TrackName;
	var TrackID;
	var PosX;
	var PosY;
	var PosZ;
	var index;			// index of driver objects
	var loopcnt = 0;	// use as index if RacePosition is 0 during several session states
	
	if(this.receivemode == "GETDEMODATA"){
		/*var recording_position = timeout;
		var demo_el = demo[recording_position];*/
		var demo_el = timeout;
		aDrivers.globals = {
			"joinable":				demo_el.globals.joinable
			,"lobbyid":				demo_el.globals.lobbyid
			,"max_member_count":	demo_el.globals.max_member_count
			,"now":					demo_el.globals.now
			,"state":				demo_el.globals.state
			,"name":				demo_el.globals.name
			,"attributes":{
				"TrackId":			demo_el.globals.attributes.TrackId
				,"GridSize":		demo_el.globals.attributes.GridSize
				,"MaxPlayers":		demo_el.globals.attributes.MaxPlayers
				,"SessionStage":	demo_el.globals.attributes.SessionStage
				,"SessionState":	demo_el.globals.attributes.SessionState
				,"SessionTimeDuration":	demo_el.globals.attributes.SessionTimeDuration
				,"SessionTimeElapsed":	demo_el.globals.attributes.SessionTimeElapsed
			}
		}
                                                
		for (var i = 0;i<demo_el.participants.length;i++){
                	
			//read data of all participants and put it in an array of PCARSdriver objects                	
			index = CalculateIndexDriverArray (demo_el.participants[i].RacePosition, loopcnt);
			loopcnt++;

			aDrivers.driverlist[index] =
							new PCARSdriver(
								demo_el.participants[i].RefId,
								demo_el.participants[i].Name,
								demo_el.participants[i].IsPlayer,
								demo_el.participants[i].GridPosition,
								demo_el.participants[i].PosX,
								demo_el.participants[i].PosY,
								demo_el.participants[i].PosZ,
								demo_el.participants[i].State,
								//no mappaing of the sector needed, because within Export correct values included
								demo_el.participants[i].CurrentSector,
								demo_el.participants[i].RacePosition,
								demo_el.participants[i].FastestLapTime,
								demo_el.participants[i].LastLapTime,
								demo_el.participants[i].Orientation,
								demo_el.participants[i].Speed,
								demo_el.participants[i].CurrentLap,
								demo_el.participants[i].VehicleId
							);
		}
                
		return aDrivers;
                
	}else{

		// http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/
		var xmlhttp = new XMLHttpRequest();
		
		// make an  xmlhttp request (synchr)
		xmlhttp.open(
				"GET",				
				fullurl + aReceiveModes[this.receivemode]
				// optional parameter for decison: async = true, sync = false
				, false
			    );
	
		// send request
		try{
			xmlhttp.send();
		}catch(err){
			
			//if(log >= 3){console.log("Error while sending Request to DS!:" + err );}
			switch ( this.receivemode ){
				case 	"GETDSDATA":  		return aDrivers;
					
				case  	"GETDRIVERDATE":	return aDrivers;	
	
				case	"GETTRACKLIST":		return aEmptyArray;
				
				case	"GETVEHICLELIST":	return aEmptyArray;
				
				case	"GETCRESTDRIVERDATA":	return aDrivers;
					
				case	"GETCREST2DRIVERDATA":	return aDrivers;
				
				case	"GETDSANDDRIVERDATA":	return aDrivers;
			} // end switch	
		}

		//sucessfull request
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {	
	
			//https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
			var myArr 			= JSON.parse( xmlhttp.responseText );
			var arrayoutput 	= myArr.toString();
			var DriverDummy		= new PCARSdriver();
			DriverDummy.SetExampleData();
	
			if(log >= 3){console.log("ReceiveDsData complete array" , myArr);}
	
		   switch ( this.receivemode ) {
	
			case  "GETDSANDDRIVERDATA":
	
				// collect DS common data
				if ( myArr.response.state == "Idle" ){
	
						//	Todo: put all values into Array?
						aDrivers.globals = {
	                                         	"joinable":				myArr.response.joinable
		                                        ,"lobbyid":             myArr.response.lobbyid
		                                        ,"max_member_count":    myArr.response.max_member_count
		                                        ,"now":                 myArr.response.now
		                                        ,"state":               myArr.response.state
		                                     }
				}else if ( myArr.response.state == "Running" ){
	
						aDrivers.globals = {
		                                         "joinable":            myArr.response.joinable
		                                        ,"lobbyid":             myArr.response.lobbyid
		                                        ,"max_member_count":    myArr.response.max_member_count
		                                        ,"now":                 myArr.response.now
		                                        ,"state":               myArr.response.state
		                                        ,"name":                myArr.response.name
	        	                                }
				}else{
					// in case of othe stati return a defined value
					aDrivers.globals = {
	                        "joinable":            "unknown mode"
	                       ,"lobbyid":             "unknown mode"
	                       ,"max_member_count":    "unknown mode"
	                       ,"now":                 "unknown mode"
	                       ,"state":               "unknown mode"
	                       ,"name":                "unknown mode"
	                       }
				}
				
				aDrivers.globals.attributes = new Array();
				//cath all attributes
				for (var key in myArr.response.attributes) {
					aDrivers.globals.attributes[key] =  myArr.response.attributes[key];
				}
									
				// collect Driverdata
				if ( myArr.response.participants.length == 0 ){
	
					if(log >= 3){console.log("no Participants found in DS, leave function and use Test data array!");}
					// put empty dummy object into array
					aDrivers.driverlist.push( DriverDummy );
	
				}else{
	
					for (var i = 0;i<myArr.response.participants.length;i++){
						
							//if(log >= 3){console.log ( "DS Participants:" , myArr.response.participants);}
							// read data of all participants and put it in an array of PCARSdriver objects						
							index = CalculateIndexDriverArray (myArr.response.participants[i].attributes.RacePosition, loopcnt);
							loopcnt++;

							aDrivers.driverlist[index] =
		                                        new PCARSdriver(
		                                                myArr.response.participants[i].attributes.RefId,
		                                                myArr.response.participants[i].attributes.Name,
		                                                myArr.response.participants[i].attributes.IsPlayer,
		                                                myArr.response.participants[i].attributes.GridPosition,
		                                                myArr.response.participants[i].attributes.PositionX,
		                                                myArr.response.participants[i].attributes.PositionY,
		                                                myArr.response.participants[i].attributes.PositionZ,
		                                                myArr.response.participants[i].attributes.State,
		                                                this.aSectormapping[ myArr.response.participants[i].attributes.CurrentSector ],		                                                
		                                                myArr.response.participants[i].attributes.RacePosition,
		                                                myArr.response.participants[i].attributes.FastestLapTime,
		                                                myArr.response.participants[i].attributes.LastLapTime,
		                                                myArr.response.participants[i].attributes.Orientation,
		                                                myArr.response.participants[i].attributes.Speed,
		                                                myArr.response.participants[i].attributes.CurrentLap,
		                                                myArr.response.participants[i].attributes.VehicleId
		                                         	);
					}
	
					// return information
					return aDrivers;
				}
				
				return aDrivers;
	
								
			case "GETTRACKLIST":

				// if no users joined return example Data
				if(log >= 3){console.log("++++++++++++++++ GETTRACKLIST / received data" , myArr );}

				if ( myArr.response.list.length == 0 ){
					
						if(log >= 3){console.log("no Participants found in DS, leave function!");}
						aDrivers.push ( DriverDummy );        
						return aDrivers;
				}
				
				var aTrackList = new Array;
	
				//build array of PCARSTRACK objects
				for (var i = 0;i<myArr.response.list.length;i++) {					 
					aTrackList.push (  
								new PCARSTRACK (
									myArr.response.list[i].id,
									myArr.response.list[i].name,
									myArr.response.list[i].gridsize
								)
							);
				}							
			
				//if(log >= 3){console.log("++++ aTrackList: " ,  aTrackList);}
				return aTrackList;
				
			case "GETVEHICLELIST":
	
				// if no vehicle data returned return empty data			
				if ( myArr.response.list.length == 0 ){
	
					if(log >= 3){console.log("++++++++++++++++ GETVEHICLELIST  array length=0 .");}
					        
					return aEmptyArray;
				}
					
				var aVehicleList = new Array;
	
				for (var i = 0;i<myArr.response.list.length;i++) {					
					//build array of PCARSVEHICLE objects 
					aVehicleList.push (  
								new PCARSVEHICLE (
									myArr.response.list[i].id,
									myArr.response.list[i].name,
									myArr.response.list[i].class
								)
							);
				}							
	
				//if(log >= 3){console.log("+++++++++++++++ aTrackList: " , aTrackList);}				
				return aVehicleList;
				
				
			case  "GETCRESTDRIVERDATA":
			
				TrackName = BuildTrackNameFromGameAPI(myArr.eventInformation.mTrackLocation,myArr.eventInformation.mTrackVariation);
				TrackID = GetTrackIDbyName(TrackName , this.aRefPointTMP);
				
				//overwrite default values with CRESt specific ones
				aDrivers.globals = {
					"joinable":				"CREST Mode"
					,"lobbyid":				"CREST Mode"
					,"max_member_count":	"CREST Mode"
					,"now":					"CREST Mode"
					,"state":				"CREST Mode"
					,"attributes":{
						"TrackId":			TrackID
						,"SessionStage":	""
						,"SessionState":	myArr.gameStates.mSessionState
					}
				}
				
				// if no users joined return example Data
				if ( myArr.participants.mNumParticipants == 0 ){				
					if(log >= 3){console.log("no Participants found in DS, leave function and use Test data array!");}	
					aDrivers.push( DriverDummy );						
					return aDrivers;
				}
					
				if(log >= 3){console.log("+-+-+-+-+-+-+-+-+-CREST Globals definition", aDrivers);}
	
				for (var i = 0;i<myArr.participants.mNumParticipants;i++) {
										
					// read data of all participants and put it in an array of PCARSdriver objects
					PosX = myArr.participants.mParticipantInfo[i].mWorldPosition[0] * 1000;
					PosY = myArr.participants.mParticipantInfo[i].mWorldPosition[1] * 1000;		
					PosZ = myArr.participants.mParticipantInfo[i].mWorldPosition[2] * 1000;
					
					index = CalculateIndexDriverArray (myArr.participants.mParticipantInfo[i].mRacePosition, loopcnt);
					loopcnt++;

					aDrivers.driverlist[index] =
						new PCARSdriver(
								0,												//RefId - NA
								myArr.participants.mParticipantInfo[i].mName,	//Name
								1,												//NA
								0,												//GridPosition - NA
								PosX,											//PositionX in meters
								PosY,											//PositionY in meters
								PosZ,											//PositionZ in meters
								"NA",											//State - NA
								this.aSectormapping[ myArr.participants.mParticipantInfo[i].mCurrentSector ],		//CurrentSector
								myArr.participants.mParticipantInfo[i].mRacePosition,		//RacePosition
								0,												//FastestLapTime - NA
								0,												//LastLapTime - NA
								0,												//Orientation - NA
								0,												//Speed - NA
								myArr.participants.mParticipantInfo[i].mCurrentLap,						//CurrentLap
								2091910841
							);
				}
	
				//if(log >= 3){console.log (  "Array of aDriver Objects: " + aDrivers);}
				return aDrivers;
				   
			case  "GETCREST2DRIVERDATA":
			
				TrackName = BuildTrackNameFromGameAPI(myArr.eventInformation.mTrackLocation,myArr.eventInformation.mTrackVariation);
				TrackID = GetTrackIDbyName(TrackName , this.aRefPointTMP);
				
				//overwrite default values with CRESt specific ones
				aDrivers.globals = {
					"joinable":				"CREST Mode"
					,"lobbyid":				"CREST Mode"
					,"max_member_count":	"CREST Mode"
					,"now":					"CREST Mode"
					,"state":				"CREST Mode"
					,"attributes":{
						"TrackId":			TrackID
						,"SessionStage":	""
						,"SessionState":	myArr.gameStates.mSessionState
					}
				}
				
				// if no users joined return example Data
				if ( myArr.participants.mNumParticipants == 0 ){				
					if(log >= 3){console.log("no Participants found in DS, leave function and use Test data array!");}	
					aDrivers.push( DriverDummy );						
					return aDrivers;
				}	
				
				if(log >= 3){console.log("+-+-+-+-+-+-+-+-+-CREST Globals definition", aDrivers);}
	
				for (var i = 0;i<myArr.participants.mNumParticipants;i++) {
					// read data of all participants and put it in an array of PCARSdriver objects
					PosX = myArr.participants.mParticipantInfo[i].mWorldPosition[0] * 1000;
					PosY = myArr.participants.mParticipantInfo[i].mWorldPosition[1] * 1000;
					PosZ = myArr.participants.mParticipantInfo[i].mWorldPosition[2] * 1000;
					
					index = CalculateIndexDriverArray (myArr.participants.mParticipantInfo[i].mRacePosition, loopcnt);
					loopcnt++;

					aDrivers.driverlist[index] =
						new PCARSdriver(
								0,												//RefId - NA
								myArr.participants.mParticipantInfo[i].mName,	//Name
								1,												//NA
								0,												//GridPosition - NA
								PosX,											//PositionX in meters
								PosY,											//PositionY in meters
								PosZ,											//PositionZ in meters
								"NA",											//State - NA
								this.aSectormapping[ myArr.participants.mParticipantInfo[i].mCurrentSector ],		//CurrentSector
								myArr.participants.mParticipantInfo[i].mRacePosition,		//RacePosition
								0,												//FastestLapTime - NA
								0,												//LastLapTime - NA
								0,												//Orientation - NA
								0,												//Speed - NA
								myArr.participants.mParticipantInfo[i].mCurrentLap,						//CurrentLap
								2091910841
							);
				}
	
				//if(log >= 3){console.log (  "Array of aDriver Objects: " + aDrivers);}
				return aDrivers;
	
		  } // End SWITCH
	
	    	}
		
		// return empty array: no DS, no Memebers, ...
	
		aDrivers.push ( DriverDummy );
		return aDrivers;
        }  // end else
}


///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function BuildTrackNameFromGameAPI(TrackLocation,TrackVariation){
        //combines the TrackName and TrackVariation from the Game API to one Name
        var TrackName;
        if (TrackVariation == ""){
                TrackName = TrackLocation; 
        }else{
                TrackName = TrackLocation + " " + TrackVariation;
        }
        
        return TrackName;
}

function GetTrackIDbyName(TrackName , TMP_RefPoint){
       //returns the TrackID for the Game API Name
        var TMP_TrackID = 9999999999;   //Default TrackID
        //var TMP_RefPoint = new Refpoint();
        var TMP_Name;
        
        for (var key in TMP_RefPoint){
                if(TMP_RefPoint[key]["Name2"] == ""){
                        TMP_Name = TMP_RefPoint[key]["Name"];
                }else{
                        TMP_Name = TMP_RefPoint[key]["Name2"];
                }
                if (TMP_Name == TrackName){
                        TMP_TrackID = key;
                }
        }
        return TMP_TrackID;
}

function CalculateIndexDriverArray (RacePostion, LoopCnt){	
	//decide if Racepsotion or Gridpostion is used as index for drivers array
	if (RacePostion != 0){
		 index = RacePostion -1; // -1 because RacePost starts with 1
	}else{                		 
		 index = LoopCnt; // because already starts with 0
	}
		
	return index;	
}


