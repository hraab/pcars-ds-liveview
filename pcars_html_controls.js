function HTMLCONTROL (){
	
	
	return this;
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// HTML DRIVERCOLOR selection functions
function DRIVERCOLOR_SetActiveElement( value ){
	
	$("#DRIVERCOLOR").val( value ).change();
	return 1;

}

function DRIVERCOLOR_AddSelElement( new_val, display_text ){
	
	
	if (  $("#DRIVERCOLOR option[value='" + new_val + "']").length == 0 ){		
	
		$('#DRIVERCOLOR').append($('<option>', {
			value: new_val,
			text: display_text
		}));
	}
	return 1;
}

function DRIVERCOLOR_DelSelElement( val2delete ){
	
	$("#DRIVERCOLOR option[value='" + val2delete + "']").remove();
	return 1;
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//HTML DRIVERCOLOR selection functions
function APIMODE_SetSelection( value ){
	
	$("#APIMODE").val( value ).change();
	return 1;
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//Prototyping
HTMLCONTROL.prototype.DRIVERCOLOR_SetActiveElement=DRIVERCOLOR_SetActiveElement;
HTMLCONTROL.prototype.DRIVERCOLOR_AddSelElement=DRIVERCOLOR_AddSelElement;
HTMLCONTROL.prototype.DRIVERCOLOR_DelSelElement=DRIVERCOLOR_DelSelElement;
HTMLCONTROL.prototype.APIMODE_SetSelection=APIMODE_SetSelection;