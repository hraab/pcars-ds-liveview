// Module for recaive data from ProjectCARS dedicated server
// requirements:    JQUERY  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>

//Receive_DS_data("[DS URL]]",9000);
// http://[DS URL]:9000/api/session/status?attributes&members&participants

function TestFunc(p1 , p2)
{
	return p1 * p2;
}

function Receive_DS_data (url,port,timeout,receivemode, aRefPointTMP){


	// todo:   Globale variablen füllen ???? oder als Rueckgabewert aus der Function?
	this.url		=	url;
	this.port		=	port;
	this.fullurl		=	'http://' +  url + ':' + port;
	this.timeout		=	timeout;
	this.receivemode	=	receivemode;		// GETDRIVERDATE , GETTRACKLIST
	this.aRefPointTMP	=	aRefPointTMP;		// hash off all available RefPoints

	//console.log("Receive_DS_data() --- receivemode: " , receivemode);

	if (this.receivevariant == undefined)
	{
		this.receivevariant = "GETDRIVERDATE";
	}


	// todo: Mapping HASH fuer receivevariant festlegen
	var aReceiveModes = {
				 "GETDRIVERDATE" 	: "/api/session/status?attributes&members&participants"
				,"GETDSDATA"	 	: "/api/session/status?attributes&members&participants"
				,"GETDSANDDRIVERDATA"	: "/api/session/status?attributes&members&participants"
				,"GETTRACKLIST"  	: "/api/list/tracks"
				,"GETVEHICLELIST"  	: "/api/list/vehicles"
				,"GETCRESTDRIVERDATA"	: "/crest/v1/api?participants=true&eventInformation=true"
			};	

//todo: Decison Using XMLHTTP class oder   THREE
//      http://api.jquery.com/jquery.getjson/
//	jQuery.getJSON( this.fullurl, 
//    			function(data){
//				console.log( data );
//				document.write ( data );
//		});
//	wait(3);
//	document.write ( data );
	
	var aDrivers		=	new Array();
	aDrivers.globals = {
         	"joinable":				"default parameters"
            ,"lobbyid":				"default parameters"
            ,"max_member_count":    "default parameters"
            ,"now":					"default parameters"
            ,"state":				"default parameters"
         }
        aDrivers.globals.attributes = new Array();
        aDrivers.globals.attributes.TrackId = 0;
        aDrivers.globals.attributes.SessionStage = "NA";
        aDrivers.globals.attributes.SessionState = "NA";

	aDrivers.driverlist	=	new Array();
	
	var data			=	new Array();
	var aEmptyArray		=	new Array();
	var TrackName;
	var TrackID;
	var PosX;
	var PosY;
	var PosZ;

	// http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/
	var xmlhttp = new XMLHttpRequest();


	// make an  xmlhttp request (synchr)
	// todo: Evtl. weniger Parameter bei der API abfragen um die Performance zu erhoehen:  /api/session/status?attributes&participants
	xmlhttp.open(
			"GET",
//			 fullurl + "/api/session/status?attributes&members&participants"
			fullurl + aReceiveModes[this.receivemode]
			// optional parameter for decison: async = true, sync = false
			, false
		    );

	// send request
	try{
		xmlhttp.send();
	}catch(err){
		
		//	console.log("Error while sending Request to DS!:" + err );
		switch ( this.receivemode ){
			case 	"GETDSDATA":  		return aDrivers;
			
			// todo: check if retrun value ist correct
			case  	"GETDRIVERDATE":	return aDrivers;	

			case	"GETTRACKLIST":		return aEmptyArray;
			
			case	"GETVEHICLELIST":	return aEmptyArray;
			
			case	"GETCRESTDRIVERDATA":	return aDrivers;
			
			case	"GETDSANDDRIVERDATA":	return aDrivers;
		} // end switch

	}

	// could onyl be set in Synchronous mode
  	// xmlhttp.timeout = this.timeout;  
		
	if (xmlhttp.readyState==4 && xmlhttp.status==200)
	{	

		//document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
		//https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
		var myArr 			= JSON.parse( xmlhttp.responseText );
		var arrayoutput 	= myArr.toString();
		var DriverDummy		= new PCARSdriver();
		DriverDummy.SetExampleData();

		console.log("ReceiveDsData complete array" , myArr);

	   switch ( this.receivemode ) {

		case  "GETDSANDDRIVERDATA":

			//https://github.com/eckhchri/pcars-ds-liveview/issues/29
			//return an object like:
			//  data.aDrivers[]
			//  data.globals{}

			
			// collect DS common data
			if ( myArr.response.state == "Idle" ){

					//	Todo: put all values into Array?
					data.globals = {
                                         	"joinable":				myArr.response.joinable
	                                        ,"lobbyid":             myArr.response.lobbyid
	                                        ,"max_member_count":    myArr.response.max_member_count
	                                        ,"now":                 myArr.response.now
	                                        ,"state":               myArr.response.state
	                                     }
			}else if ( myArr.response.state == "Running" ){

					data.globals = {
	                                         "joinable":            myArr.response.joinable
	                                        ,"lobbyid":             myArr.response.lobbyid
	                                        ,"max_member_count":    myArr.response.max_member_count
	                                        ,"now":                 myArr.response.now
	                                        ,"state":               myArr.response.state
	                                        ,"name":                myArr.response.name
        	                                }
			}else{
				// in case of othe stati return a defined value
				data.globals = {
                        "joinable":            "unknown mode"
                       ,"lobbyid":             "unknown mode"
                       ,"max_member_count":    "unknown mode"
                       ,"now":                 "unknown mode"
                       ,"state":               "unknown mode"
                       ,"name":                "unknown mode"
                       }
			}
			data.globals.attributes = new Array();
			//cath all attributes
			for (var key in myArr.response.attributes) {
			
				data.globals.attributes[key] =  myArr.response.attributes[key];
			}
			

			//prepare empty array
			data.driverlist = [];
			
			// collect Driverdata
			if ( myArr.response.participants.length == 0 ){

				console.log("no Participants found in DS, leave function and use Test data array!");

				// put empty dummy object into array
				data.driverlist.push( DriverDummy );
				//data.driverlist.push( DriverDummy );

			}else{

				for (var i = 0;i<myArr.response.participants.length;i++){
					
        	                        //console.log ( "DS Participants:" , myArr.response.participants);
	                                // read data of all participants and put it in an array of PCARSdriver objects
					
								
					                 data.driverlist.push (
	                                        new PCARSdriver(myArr.response.participants[i].attributes.RefId,
	                                                myArr.response.participants[i].attributes.Name,
	                                                myArr.response.participants[i].attributes.GridPosition,
	                                                myArr.response.participants[i].attributes.PositionX,
	                                                myArr.response.participants[i].attributes.PositionY,
	                                                myArr.response.participants[i].attributes.PositionZ,
	                                                myArr.response.participants[i].attributes.State,
	                                                myArr.response.participants[i].attributes.CurrentSector,
	                                                myArr.response.participants[i].attributes.RacePosition,
	                                                myArr.response.participants[i].attributes.FastestLapTime,
	                                                myArr.response.participants[i].attributes.LastLapTime,
	                                                myArr.response.participants[i].attributes.Orientation,
	                                                myArr.response.participants[i].attributes.Speed,
	                                                myArr.response.participants[i].attributes.CurrentLap,
	                                                myArr.response.participants[i].attributes.VehicleId,
	                                                {       
	                                        				TrackId: myArr.response.attributes.TrackId
	                                                        ,GridSize: myArr.response.attributes.GridSize
	                                                }
	                                         	)
                                        );
				}

				// return information
				return data;
			}
			
			return data;

			
			
		case  "GETDRIVERDATE":
		
			// if no users joined return example Data
			if ( myArr.response.participants.length == 0 ){
			
				console.log("no Participants found in DS, leave function and use Test data array!");

				aDrivers.push( DriverDummy );

				console.log("+-+-+-: " ,  aDrivers);				

				return aDrivers;
			}
		 
			for (var i = 0;i<myArr.response.participants.length;i++)
			{
				//console.log ( "DS Participants:" , myArr.response.participants);
				// read data of all participants and put it in an array of PCARSdriver objects
				aDrivers.push (
					new PCARSdriver(myArr.response.participants[i].attributes.RefId,
						myArr.response.participants[i].attributes.Name,
						myArr.response.participants[i].attributes.GridPosition,
						myArr.response.participants[i].attributes.PositionX,
						myArr.response.participants[i].attributes.PositionY,
						myArr.response.participants[i].attributes.PositionZ,
						myArr.response.participants[i].attributes.State,
						myArr.response.participants[i].attributes.CurrentSector,
						myArr.response.participants[i].attributes.RacePosition,
						myArr.response.participants[i].attributes.FastestLapTime,
					        myArr.response.participants[i].attributes.LastLapTime,
						myArr.response.participants[i].attributes.Orientation,
						myArr.response.participants[i].attributes.Speed,
						myArr.response.participants[i].attributes.CurrentLap,
                        myArr.response.participants[i].attributes.VehicleId,
						{ 	TrackId: myArr.response.attributes.TrackId
							,GridSize : myArr.response.attributes.GridSize
						}
						)
					);
			
			}

			//console.log (  "Array of aDriver Objects: " + aDrivers);
  
			// return information
	                return aDrivers;		

		case "GETTRACKLIST":

			// todo: Auslesen der trackIDs und den dazugehoerigen Namen

			// if no users joined return example Data
			console.log("++++++++++++++++ GETTRACKLIST / received data" , myArr );
			// todo FAILURE within check !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
			if ( myArr.response.list.length == 0 ){
				
					console.log("no Participants found in DS, leave function!");
					aDrivers.push ( DriverDummy );        
					return aDrivers;
			}
			
			//console.log("++++TRACKLIST: " ,  myArr);

			var aTrackList = new Array;

			for (var i = 0;i<myArr.response.list.length;i++)
                        {
				//build array of PCARSTRACK objects 
				aTrackList.push (  
							new PCARSTRACK (
								myArr.response.list[i].id,
								myArr.response.list[i].name,
								myArr.response.list[i].gridsize
							)
						);
			}							

			//console.log("+++++++++++++++ aTrackList: " , aTrackList);			

			return aTrackList;
			
		case "GETVEHICLELIST":

			// todo: Auslesen der trackIDs und den dazugehoerigen Namen

			// if no users joined return example Data
			console.log("++++++++++++++++ GETVEHICLELIST / received data" , myArr );
			// todo FAILURE within check !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
                        if ( myArr.response.list.length == 0 ){

                                console.log("no Participants found in DS, leave function!");
                                aDrivers.push ( DriverDummy );        
                                return aDrivers;
                        }
			
			//console.log("++++TRACKLIST: " ,  myArr);

			var aVehicleList = new Array;

			for (var i = 0;i<myArr.response.list.length;i++)
                        {
				//build array of PCARSTRACK objects 
				aVehicleList.push (  
							new PCARSVEHICLE (
								myArr.response.list[i].id,
								myArr.response.list[i].name,
								myArr.response.list[i].class
							)
						);
			}							

			//console.log("+++++++++++++++ aTrackList: " , aTrackList);			

			return aVehicleList;
			
		case  "GETCRESTDRIVERDATA":
		
			//overwrite default values with CRESt specific ones
			aDrivers.globals = {
             	"joinable":				"CREST Mode"
                ,"lobbyid":				"CREST Mode"
                ,"max_member_count":    "CREST Mode"
                ,"now":					"CREST Mode"
                ,"state":				"CREST Mode"
             	}
             	aDrivers.globals.attributes = new Array();
        	aDrivers.globals.attributes.TrackId = 0;
        	aDrivers.globals.attributes.SessionStage = "NA";
	 	aDrivers.globals.attributes.SessionState = "NA";
			
			// if no users joined return example Data
			if ( myArr.participants.mNumParticipants == 0 ){
			
				console.log("no Participants found in DS, leave function and use Test data array!");

				aDrivers.push( DriverDummy );

				console.log("+-+-+-: " ,  aDrivers);				

				return aDrivers;
			}

			
			console.log("+-+-+-+-+-+-+-+-+-CREST Globals definition", aDrivers);
			
		 	TrackName = BuildTrackNameFromGameAPI(myArr.eventInformation.mTrackLocation,myArr.eventInformation.mTrackVariation);
			TrackID = GetTrackIDbyName(TrackName , this.aRefPointTMP);

			for (var i = 0;i<myArr.participants.mNumParticipants;i++)	//check if mNumParticipants works correct
			{
				//console.log ( "DS Participants:" , myArr.response.participants);
				// read data of all participants and put it in an array of PCARSdriver objects
				PosX = myArr.participants.mParticipantInfo[i].mWorldPosition[0] * 1000;
				PosY = myArr.participants.mParticipantInfo[i].mWorldPosition[1] * 1000;
				PosZ = myArr.participants.mParticipantInfo[i].mWorldPosition[2] * 1000;
				aDrivers.driverlist.push (
					new PCARSdriver(0,							//RefId - NA
						myArr.participants.mParticipantInfo[i].mName,			//Name
						0,								//GridPosition - NA
						PosX,								//PositionX in meters
						PosY,								//PositionY in meters
						PosZ,								//PositionZ in meters
						"NA",								//State - NA
						myArr.participants.mParticipantInfo[i].mCurrentSector,		//CurrentSector
						myArr.participants.mParticipantInfo[i].mRacePosition,		//RacePosition
						0,								//FastestLapTime - NA
					        0,								//LastLapTime - NA
						0,								//Orientation - NA
						0,								//Speed - NA
						999999,							//CurrentLap
						2091910841,								//VehicleID
						{ 	TrackId: TrackID					//TrackID
							,GridSize : 0						//GridSize - NA
						}
						)
					);
			
			}

			//console.log (  "Array of aDriver Objects: " + aDrivers);
  
			// return information
	                return aDrivers;

	  } // End SWITCH

    	}
	
	// return empty array: no DS, no Memebers, ...

	aDrivers.push ( DriverDummy );
	return aDrivers;

}

function BuildTrackNameFromGameAPI(TrackLocation,TrackVariation)
{
        //combines the TrackName and TrackVariation from the Game API to one Name
        var TrackName;
        if (TrackVariation == ""){
                TrackName = TrackLocation; 
        }else{
                TrackName = TrackLocation + " " + TrackVariation;
        }
        
        return TrackName;
}
function GetTrackIDbyName(TrackName , TMP_RefPoint)
{
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
