// Change the settings portion to configure direction format, color, rounding and abbreviations
// This is an Arcade expression

// SETTINGS
var QuadrantBearingFormat = true; //set 'true' for quadrant bearing, 'false' for north azimuth
var ShowDistance = true;   //set as 'true' to show distance
var ShowDirection = true;  //set as 'true' to show direction
var ShowRadius = true;     //set as 'true' to show radius
var ShowCurveParemater = true;    //set as 'true' to show a curve parameter
var CurveParameter = "ArcLength"; //set as 'ArcLength' or 'Chord' or 'Angle' for central angle. Case sensitive!
var ErrorString = "COGO ERROR";   //set to display invalid COGO combinations
var RadiusAbbr = 'R=';     //radius abbreviation
var ArclengthAbrr = 'L=';  //arclength abbreviation
var ChordAbbr = 'C=';      //chord abbreviation
var AngleAbbr = 'A=';      //central Angle abbreviation
var DistUnitRounding = 3;  //number of decimal places for distance units: distance, radius, arclength & chord
var NumberFormat = "#,###.000" //number format. In this example: thousands separator with padding of 2 zeros 
var directionColor = "blue='255'"; //direction color: red, green, blue, cyan, magenta, yellow, black. You can also use RGB or CYMK combinations.
var distanceColor = "black='255'"; //distance color: red, green, blue, cyan, magenta, yellow, black. You can also use RGB or CYMK combinations.
var radiusColor = "blue='255'";    //radius color:  red, green, blue, cyan, magenta, yellow, black. You can also use RGB or CYMK combinations.
var curveParamColor = "black='255'"; //curve parameter color:  red, green, blue, cyan, magenta, yellow, black. You can also use RGB or CYMK combinations.
var partialCOGOColor = "magenta='255'"; //partial COGO color: red, green, blue, cyan, magenta, yellow, black. You can also use RGB or CYMK combinations.
var invalidCOGOColor = "red='255'"; //invalid COGO color: red, green, blue, cyan, magenta, yellow, black. You can also use RGB or CYMK combinations.
var fontNameSize = "<FNT name = 'Arial' size = '8'>"; //font type and size

// VARIABLES
var direction=$feature.Direction;
var distance=$feature.Distance;
var radius=$feature.Radius;
var arclength=$feature.Arclength;
var radius2=$feature.Radius2
var prefix;  // quadrant bearing prefix
var postfix; // quadrant bearing postfix
var bearing; 
var quadbearing;
var binaryDictionary; //binary dictionary to check COGO combinations
var checksum=0; //initialize checksum
var validValuesArray; //array of valid values for COGO combinations
var partialValuesArray; //array of partial values for COGO
var degrees;
var minutes;
var seconds;
var DMS;
var directionStr = ""; //direction string using for label
var distanceStr = "";  //distance string using for label
var radiusStr = "";    //radius string using for label
var curveStr = "";     //curve parameter string using for label
var angleRad; //curve angle in radians
var COGOValidity; //COGO combinations validity. can be valid, partial or invalid.


function NorthAzimuth2Quadbearing(azimuth){
            if (azimuth<90 && azimuth>=0){
                        bearing=azimuth;
                        prefix = "N";
                        postfix= "E";}
            else if (azimuth<180 && azimuth>=90){
                        bearing=180-azimuth;
                        prefix = "S";
                        postfix= "E";}
            else if (azimuth<270 && azimuth>=180){
                        bearing=abs(180-azimuth);
                        prefix = "S";
                        postfix= "W";}
            else if (azimuth<360 && azimuth>=270){
                        bearing=360-azimuth;
                        prefix = "N";
                        postfix= "W";}
            
            degrees=floor(bearing);
            minutes=floor((bearing-degrees)*60)
            seconds=((bearing-degrees-minutes/60)*3600)
            if (seconds>=59.5){
                seconds=0;
                minutes+=1;
                if (minutes==60){
                    minutes=0;
                    degrees+=1;}}
            quadbearing=prefix+degrees+"°"+text(minutes,"00")+"'"+text(seconds,"00")+"''"+postfix;
            return quadbearing;
}

function DMS(bearing){
    degrees=floor(bearing);
    minutes=floor((bearing-degrees)*60)
    seconds=((bearing-degrees-minutes/60)*3600)
    if (seconds>=59.5){
        seconds=0;
        minutes+=1;
        if (minutes==60){
            minutes=0;
            degrees+=1;}}
    DMS=degrees+"°"+text(minutes,"00")+"'"+text(seconds,"00")+"''";
    return DMS;
    
}
function IsValidCOGO(direction, distance, radius, arclength, radius2) {
    binaryDictionary= Dictionary('dir', 1, 'dist',2, 'rad',4, 'arc',8, 'rad2',16)
    if (!IsEmpty(direction)) {checksum+=binaryDictionary.dir}
    if (!IsEmpty(distance)) {checksum+=binaryDictionary.dist}
    if (!IsEmpty(radius)) {checksum+=binaryDictionary.rad}
    if (!IsEmpty(arclength)) {checksum+=binaryDictionary.arc}
    if (!IsEmpty(radius2)) {checksum+=binaryDictionary.rad2}
    
    validValuesArray=[0,3,4,8,13,29]; //array of valid combinations: '0' for nothing, ... '13' for direction & radius & arclength ...
    partialValuesArray=[1,2]; //array of partial combinations: '1' for only direction, '2' for only distance...
        
    if (IndexOf(validValuesArray,checksum)>-1) { // a negative value is returned if checksum value is not in the a valid combination array
        return "valid";
    }
    if (IndexOf(partialValuesArray,checksum)>-1){
        return "partial";        
    }
    return "invalid";
}

COGOValidity = IsValidCOGO(direction, distance, radius, arclength, radius2);
if ( COGOValidity == "invalid") { //if invalid COGO return error string
    return "<BOL><CLR " + invalidCOGOColor + ">" + fontNameSize + ErrorString + "</FNT></CLR></BOL>";    
}

if (COGOValidity == "partial") { //if a partial COGO change colors
    distanceColor = partialCOGOColor;
    directionColor = partialCOGOColor;
}

// Direction string
if (ShowDirection) {
    if (IsEmpty(direction)==false) { 
        if (QuadrantBearingFormat==true) {  //using quadrant bearing format
                directionStr = "<CLR " + directionColor + ">" + fontNameSize + NorthAzimuth2Quadbearing(direction) + "</FNT></CLR>";
        }
        else {  //using north azimuth format
            directionStr = "<CLR " + directionColor + ">" + fontNameSize + DMS(direction) + "</FNT></CLR>";
        }
    }
}

// Distance string
if (ShowDistance) {
    if (IsEmpty(distance)==false) {
    distanceStr = "<CLR " + distanceColor + ">" + fontNameSize +  text(round(distance,DistUnitRounding), NumberFormat) + "</FNT></CLR>" + " m";
    }
}

//Radius String
if (ShowRadius) {
    if (!IsEmpty(radius)) {
        if (radius>0) {   // if radius is positive  --> right
            radiusStr = "<CLR " + radiusColor + ">" + fontNameSize + RadiusAbbr + text(round(radius, DistUnitRounding), NumberFormat) + "</FNT></CLR>";
        }
        else {           // if radius is negative  --> left
            radiusStr = "<CLR " + radiusColor + ">" + fontNameSize + RadiusAbbr + " -" + text(round(abs(radius), DistUnitRounding),NumberFormat) + "</FNT></CLR>";                
        }
    }
}

// Curve Parameter
if (ShowCurveParemater) {
        if (!IsEmpty(arclength)) {
            if (CurveParameter == 'ArcLength') {
                curveStr = "<CLR " + curveParamColor + ">" + fontNameSize + ArclengthAbrr + text(round(arclength, DistUnitRounding), NumberFormat) + "</FNT></CLR>"; //return Arc length                
            }
            angleRad = arclength/(abs(radius)) //calculate angle in radians
            if (CurveParameter == 'Angle') {
                curveStr = "<CLR " + curveParamColor + ">" + fontNameSize + AngleAbbr + DMS(angleRad * 180 / pi) + "</FNT></CLR>"; // convert radian to degrees and show as DMS
            }
            if (CurveParameter == 'Chord') {
                curveStr = "<CLR " + curveParamColor + ">" + fontNameSize + ChordAbbr + text(round((2 * abs(radius) * Sin(angleRad/2)),DistUnitRounding), NumberFormat) + "</FNT></CLR>"; //calculate chord length
            }            
        }
}
    
// Assemble label string
if (IsEmpty(radius)) { //if its empty it is not a curve
    return directionStr + "\n" + distanceStr
}
else { //it's a curve
    return radiusStr + "\n" + curveStr;
}



