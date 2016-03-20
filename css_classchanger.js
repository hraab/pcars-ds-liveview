// CLASS of an pCars Driver
function CSSClassChanger ()
{
	this.CurrentState	= "";
	this.aCSSClasses 	= new Array(); 	//Array of all handled CSS Clases
	// structure:
	//		aCSSClasses['hideallsvgs']
	//		aCSSClasses['colortop3']
	//		...
	
	return this;

}

	// usage:
	// add class:	
	//				var object_TestCSSClass = setStyle(
	//                     '.TestCSSClass{ fill: grey; } \n',
	//                     object_TestCSSClass );
	// remove class:
	// 					if(object_TestCSSClass) setStyle( '', object_TestCSSClass );
	//
	function setStyle(cssText) {
				
		var sheet = document.createElement('style');
		sheet.type = 'text/css';
		/* Optional */ window.customSheet = sheet;
		(document.head || document.getElementsByTagName('head')[0]).appendChild(sheet);
	    return (setStyle = function(cssText, node) {
			if(!node || node.parentNode !== sheet)
	            return sheet.appendChild(document.createTextNode(cssText));
			node.nodeValue = cssText;
			return node;
		})(cssText);
	};
	
	// a function to clear all css clases that were managed by this object
	function ClearAllCssClases()
	{
		for (var key in this.aCSSClasses){
			
			//delete css class from html DOM structure
			if(this.aCSSClasses[key]) setStyle( '', this.aCSSClasses[key] );
			
			//delte from internale list
			delete this.aCSSClasses[key];
		}
		
		return 1;
	}
	

	// hide svg objects during change of race session
	function HideAllSvg()
	{
		var CSSStyleHandle = setStyle(
				    '.marker{ display: none; } \n',
				    CSSStyleHandle );
		//remember object handle
		this.aCSSClasses['hideallsvgs']	=	(CSSStyleHandle);
		
		return 1;
	}
	//unhide svg ojects
	function UnHideAllSvg(){
		
		if(this.aCSSClasses['hideallsvgs']) setStyle( '', this.aCSSClasses['hideallsvgs'] );
		delete this.aCSSClasses['hideallsvgs'];
		
		return 1;
	}
	//color the first tree vehicles
	function ColorTop3vehicles(){
		
		var CSScls;
		var CSSstr = '';
		CSSstr += 'circle.CSS_RacePos_1 {fill: gold; stroke-width: 3px }\n';
		CSSstr += 'circle.CSS_RacePos_2 {fill: silver; stroke-width: 3px }\n';
		CSSstr += 'circle.CSS_RacePos_3 {fill: #CD7F32; stroke-width: 3px }\n';
		
		this.aCSSClasses['colortop3'] = this.aCSSClasses['colortop3'] = setStyle( 
										CSSstr
										, CSScls );
				
		return 1;
	}

CSSClassChanger.prototype.setStyle=setStyle;
CSSClassChanger.prototype.HideAllSvg=HideAllSvg;
CSSClassChanger.prototype.UnHideAllSvg=UnHideAllSvg;
CSSClassChanger.prototype.ClearAllCssClases=ClearAllCssClases;
CSSClassChanger.prototype.ColorTop3vehicles=ColorTop3vehicles;