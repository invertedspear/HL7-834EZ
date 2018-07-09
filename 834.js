let ISA = class{
	constructor(segString){
		//defined string lengths, ex:ISA*00*          *00*          *ZZ*260302465      *01*MEMD           *180627*0540*^*00501*000000033*0*P*:~
		//```````````````````````````000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111
		//```````````````````````````000000000011111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000
		//```````````````````````````012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
	this.AuthorizationInformationQualifier = segString.substring(4,6);
	this.AuthorizationInformation = segString.substring(7,17);
	this.SecurityInformationQualifier = segString.substring(18,20);
	this.SecurityInformation = segString.substring(21,31);
	this.InterchangeIDQualifier = segString.substring(32,34);
	this.InterchangeSenderID = segString.substring(35,50);
	this.InterchangeIDQualifier = segString.substring(51,53);
	this.InterchangeReceiverID = segString.substring(54,69);
	this.InterchangeDate = segString.substring(70,76); //YYMMDD
	this.InterchangeTime = segString.substring(77,81); //HHMM
	this.RepetitionSeparator = segString.substring(82,83);
	this.InterchangeControlVersionNumber = segString.substring(84,89);
	this.InterchangeControlNumber = segString.substring(90,99);
	this.AcknowledgmentRequested = segString.substring(100,101);
	this.InterchangeUsageIndicator = segString.substring(102,103);
	this.ComponentElementSeparator = segString.substring(104,105);
	}
}

let INSSeg = class{
	constructor(segArray){
		this.SubscriberIndicator = segArray[1];
		this.Individual_Relationship_Code = segArray[2];
		this.MaintenanceTypeCode = segArray[3];
		this.MaintenanceReasonCode = segArray[4];
		this.BenefitStatusCode = segArray[5];
		this.MedicareStatusCode = segArray[6];
		this.COBRA = segArray[7];
		this.Employment_Status_Code = segArray[8];
		this.Student_Status_Code = segArray[9];//Not Used, only defined by spec
		this.HandicapIndicator = segArray[10];//Not Used, only defined by spec
		this.DateTimePeriodQualifier = segArray[11];//Not Used, only defined by spec
		this.DateOfDeath = segArray[12];//Not Used, only defined by spec
		this.ConfidentialityCode = segArray[13];//Not Used, only defined by spec
	}
}

let CSVRow = class{
	constructor(){
		this.Partner_Federal_ID = null;
		this.Individual_Relationship_Code = null;
		this.Employment_Status_Code = null;
		this.Student_Status_Code = null;
		this.Subscriber_Employee_Number = null;
		this.Member_Policy_Number = null;
		this.Entity_Organization = null;
		this.Group_Policy = null;
		this.Last_Name = null;
		this.First_Name = null;
		this.Middle_Name = null;
		this.Phone_Number = null;
		this.Email_Address = null;
		this.Address_1 = null;
		this.Address_2 = null;
		this.City = null;
		this.State = null;
		this.ZipCode = null;
		this.DOB = null;
		this.Gender = null;
		this.Plan_Coverage_Description = null;
		this.Eligibility_Begin_Date = null;
		this.Eligibility_End_Date = null;
		this.Benefit_Start = null;
		this.Benefit_End = null;
	}
}

function convertFile(evt){
	//console.dir(arguments);
	var inFile = evt.target.files[0];

	var fileReader = new FileReader();

	fileReader.onload =function(evt){
		let inText = evt.target.result.split(/~\r?\n/);
		let outText="";
		let fileDTP = null;
		let csvRow = new CSVRow();

		inText.forEach(segment => {
			let type = segment.split("*")[0];


			switch(type){
				case "ISA" :
					document.getElementById('status').innerHTML += 'ISA header ignored.<br />'
					console.log('processing ISA header')
					/*The ISA header is really just meta data, doesn't seem important for our purposes. It does Envelope the entire file. Column 13 of this line will match a footer of the envelope
					First Line is below:
					ISA*00*          *00*          *ZZ*260302465      *01*MEMD           *180627*0540*^*00501*000000033*0*P*:~
					⤹----------------------------------------------------------------------------------⤴︎
					IEA*1*000000033~
					Last Line is above
					*/
					//outText += processInterchangeControlHeader(segment);
				break;
				case "GS":
				document.getElementById('status').innerHTML += 'GS header ignored.<br />'
					console.log('processing GS header')
					/*Again, for our purposes, no point but this is a group header. The control number in column 6 will match it's closing line column 2
					GS*BE*260302465*MEMD*20180627*0540*652282715*X*005010X220A1~
					⤹-----------------------------⤴︎
					GE*1*652282715~
					*/
				break;
				case "ST":
					document.getElementById('status').innerHTML += 'Cheking Set Type... '
					console.log('processing ST header')
					/*This will actually tell us if it's an 834 file or not,
					ST*834*B3369A12E*005010X220A1~

					*/
					if(!processTransactionSet(segment)){
						document.getElementById('status').innerHTML += '834 not found. Abandoning process.'
						throw {}
					}else{
						document.getElementById('status').innerHTML += '834 found, continuing<br />'
						console.log('File type is good');
					}
				break;
				case "BGN":
					document.getElementById('status').innerHTML += 'BGN header ignored.<br />'
				break;
				case "DTP":
					let processedDTP = processDTP(segment);
					if(processedDTP.type == "EnrollmentFile"){
						document.getElementById('status').innerHTML += 'Enrollment file DTP ignored.<br />'
					}
				break;
				case "N1":
					//Sponsor Name, payer name, not important for us at this time
					let processedN1 = processN1(segment);
					if(processedN1.action == "skip"){
						document.getElementById('status').innerHTML += processedN1.type + 'codes ignored.<br />'
					}else{
						document.getElementById('status').innerHTML += 'Unhandled segment type, Aborting: ' + segment.toString() + '<br />'
					}
				break;
				case "INS":
					//this starts and Insured Member Level Detail
					if(Object.keys(csvRow).length > 0){
						//write the csv row need to do this at the EOF too
					}
					csvRow = new CSVRow();
					csvRow.Individual_Relationship_Code = 
				break;


				default:
					document.getElementById('status').innerHTML += 'Unknown segment type, Aborting: ' + segment.toString() + '<br />'
					throw {};
				break;
			}
		});
		console.dir(inText);
		console.dir(outText);
	}

	fileReader.readAsText(inFile);
	document.getElementById('status').innerHTML += 'File read into system.<br />'
	console.log('done');
}

function processInterchangeControlHeader(segment){
	//incomplete since I don't expect this to actually get used I abbandoned it where I was
	let retText = "";
	let items = segment.split("*");
	for(let i=1;i<items.length; i++){
		if(i != 1){
			retText += ","
		}
		retText += '"' + trim(items[i]) + '"';
	}
	return retText
}

function processTransactionSet(segment){
	let setCols = segment.split('*');
	let isFileCorrectType = true;
	if(setCols[1] != 834){
		isFileCorrectType = false; 
	}
	return isFileCorrectType
}

function processDTP(segment){
	let dtpCols = segment.split('*');
	let retObj = {};

	switch(dtpCols[1]){
		case "382":
			//Date type is Enrollment
			retObj.type="EnrollmentFile"
			retObj.value=dtpCols[3];
		break;
		default:
			document.getElementById('status').innerHTML += 'Unknown DTP, Aborting: ' + segment.toString() + '<br />'
			throw {};
		break;
	}
	return retObj;
}

function processN1(segment){
	let retObj = {};
	let n1Cols = segment.split('*');
	switch(n1Cols[1]){
		case "P5":
			retObj.type = "Plan Sponsor";
			retObj.action = "skip";
		break;
		case "IN":
			retObj.type = "Insurer";
			retObj.action = "skip";
		break;
		default:
			document.getElementById('status').innerHTML += 'Unknown Entity Identifier Code, Aborting: ' + segment.toString() + '<br />'
			throw {};
		break;
	}
	return retObj;
}