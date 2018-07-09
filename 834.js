/**
 * The goal is to process 834 files for now. Considerations to advance it to process other HL7 files in the future.
 * TODO:
 * 		1) load up the code to description dictionaries for each segment type so I don't have to rely on known codes
 * 		2) improve thrown aborting errors
 * 		3) make variable names consistent style
 */

let ISA = class{ // Interchange Control Headers
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
	this.InterchangeControlNumber = segString.substring(90,99); // Must Match IEA.InterchangeControlNumber IEA closes ISA
	this.AcknowledgmentRequested = segString.substring(100,101);
	this.InterchangeUsageIndicator = segString.substring(102,103);
	this.ComponentElementSeparator = segString.substring(104,105);
	}
}

let GS = class{ //Functional Group Headers
	constructor(input){ //I want to overload this, so it can take either a string or an array
		let consArray = input.split('*');
		this.FunctionalIdentifierCode = consArray[1];
		this.ApplicationSenderCode = consArray[2];
		this.ApplicationReceiverCode = consArray[3];
		this.Date = consArray[4];
		this.Time = consArray[5];
		this.GroupControlNumber = consArray[6]; //Must match GE.GroupCountrolNumber, GE closes GS
		this.ResponsibleAgencyCode = consArray[7];
		this.Version = consArray[8]; //Must match with ST.ImplementationConventionReference
	}
}

let ST = class{ //Transaction Set Headers
	constructor(input){//I want to overload this, so it can take either a string or an array
		let consArray = input.split('*');
		this.TransactionSetIDCode = consArray[1];
		this.TransactionSetControlNumber = consArray[2]; //Must match SE.TransactionSetControlNumber. SE closes ST
		this.ImplementationConventionReference = consArray[3]; //Must match GS.version
	}
}

let BGN = class{//Beginning Segment
	constructor(input){
		let consArray = input.split('*');
		this.TransactionSetPurposeCode = consArray[1];
		this.ReferenceID02 = consArray[2];
		this.Date = consArray[3];
		this.Time = consArray[4];
		this.TimeCode = consArray[5];
		this.ReferenceID06 = consArray[6];
		this.TransactionTypeCode = consArray[7];
		this.ActionCode = consArray[8]; 
	}
}

let DTP = class{
	constructor(input){
		let consArray = input.split('*');
		this.Qualifier = consArray[1];
		this.Format = consArray[2];
		this.DTPString = consArray[3];
		this.QualifierDesc = "";
	}
}

let Entity = class{
	constructor(input){
		let consArray = input.split('*');
		this.EntityIDCode = consArray[1];
		this.EntityName = consArray[2];
		this.IDCodeQualifier = consArray[3]; //FI means Federal Taxpayer ID #
		this.IDCode = consArray[4];
		this.EntityIDDesc = "";
		this.EntityAction = "";
	}
}

let INSSeg = class{
	constructor(input){
		let segArray = input.split('*');
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

let REFSeg = class{
	constructor(input){
		let segArray = input.split('*');
		this.ReferenceIDQualifier = segArray[1];
		this.ReferenceValue = segArray[2];
		this.ReferenceDesc = "";
	}
}

let NM1Seg = class{ //information source name
	constructor(input){
		let segArray = input.split('*');
		this.EntityIDCode = segArray[1];
		this.EntityTypeQualifier = segArray[2];
		this.MemberLastName = segArray[3];
		this.MemberFirstName = segArray[4];
		this.MemberMiddleName = segArray[5];
		this.NamePrefix = segArray[6];
		this.NameSuffix = segArray[7];
		this.IDCodeQualifier = segArray[8];
		this.MemberId = segArray[9];
		this.EntityCodeDesc = null;
	}
}

let PERSeg = class{ //Phone or email
	constructor(segString){
		let segArray = segString.split('*');
		this.ContactFunctionCode = segArray[1];
		this.Name = segArray[2];
		this.CommunicationNumberQualifier = segArray[3];
		this.CommunicationNumber = segArray[4];
		this.CommunicationNumberQualifier2 = segArray[5];
		this.CommunicationNumber2 = segArray[6];
		this.ContactFunctionDesc = null;
		this.CommunicationDescription = null;
		this.CommunicationDescription2 = null;
	}
}

let N3Seg = class{ //Street Address
	constructor(segString){
		let segArray = segString.split('*');
		this.AddressLine1 = segArray[1];
		this.AddressLine2 = segArray[2];
	}
}

let N4Seg = class{ //City state zip
	constructor(segString){
		let segArray = segString.split('*');
		this.City = segArray[1];
		this.State = segArray[2];
		this.PostalCode = segArray[3];
		this.Country = segArray[4];
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

const ReferenceIDQualifierCodeDictionary = {
	"0F" : "SubscriberNumber",
	"1L" : "GroupOrPolicyNumber"
}

const N1CodeDictionary = {
	"P5" : {
		"description"	: "Plan Sponsor",
		"action"		: "GetFederalID"
	},
	"IN" : {
		"description"	: "Insurer",
		"action"		: "skip"
	}
}

const DTPCodeDictionary = {
	"382" : "EnrollmentFile",
	"336" : "EmploymentBegin"
}

const EntityIdentfierCodeDictionay = {
	"IL" : "InsuredOrSubscriber"
}

const EntityTypeCodeDictionary = {
	"1" : "Person",
	"2" : "Non-Person"
}

const ContactFunctionCodeDict = {
	"IP" : "Insured Party"
}

const CommunicationTypeQualifierDict = { //This one is actually complete as far as I can tell.
	"BN" : "Beeper", //Really?! 
	"CP" : "Cellular", 
	"EM" : "EMail", 
	"FX" : "Fax",
	"HP" : "Home",
	"NP" : "Night",
	"TE" : "Telephone", 
	"WP" : "Work"
}

function convertFile(evt){
	//console.dir(arguments);
	var inFile = evt.target.files[0];

	var fileReader = new FileReader();

	fileReader.onload =function(evt){
		let inText = evt.target.result.split(/~\r?\n/);
		let outText="";
		let PartnerFederalID = null;
		let csvRow = new CSVRow();

		inText.forEach(segment => {
			let type = segment.split("*")[0];
			switch(type){
				case "ISA" : //Interchange Control Header
					console.log('processing ISA header');
					let thisISA = new ISA(segment);
					console.dir(thisISA);
					document.getElementById('status').innerHTML += 'ISA header ignored.<br />';
				break;
				case "GS":
					let thisGS = new GS(segment);
					console.dir(thisGS);
					document.getElementById('status').innerHTML += 'GS header ignored.<br />';
				break;
				case "ST":
					console.log('processing ST header');
					let thisST = new ST(segment);
					console.dir(thisST);
					document.getElementById('status').innerHTML += 'Cheking Set Type... ';
					
					if(thisST.TransactionSetIDCode != 834){
						document.getElementById('status').innerHTML += '834 not found. Abandoning process.';
						throw {}
					}else{
						document.getElementById('status').innerHTML += '834 found, continuing<br />';
						console.log('File type is good');
					}
				break;
				case "BGN":
					let thisBGN = new BGN(segment);
					console.dir(thisBGN);
					document.getElementById('status').innerHTML += 'BGN header ignored.<br />';
				break;
				case "DTP":
					let thisDTP = new DTP(segment);
					thisDTP.QualifierDesc = DTPCodeDictionary[thisDTP.Qualifier];
					console.dir(thisDTP);
					switch(thisDTP.QualifierDesc){
						case "EnrollmentFile":
							document.getElementById('status').innerHTML += 'Enrollment file DTP ignored.<br />';
						break;
						case "EmploymentBegin":
							document.getElementById('status').innerHTML += 'Employment Start Date ignored.<br />';
						break;
						default:
							document.getElementById('status').innerHTML += 'Unknown DTP type, Aborting: ' + segment.toString() + '<br />'
							throw {};
						break;
					}
					if(thisDTP.QualifierDesc == "EnrollmentFile"){
						document.getElementById('status').innerHTML += 'Enrollment file DTP ignored.<br />';
					}
				break;
				case "N1":
					let thisN1 = new Entity(segment);
					thisN1.EntityAction = N1CodeDictionary[thisN1.EntityIDCode].action;
					thisN1.EntityIDDesc = N1CodeDictionary[thisN1.EntityIDCode].description;
					console.dir(thisN1);
					switch(thisN1.EntityAction){
						case "skip":
							document.getElementById('status').innerHTML += thisN1.EntityIDDesc + ' codes ignored.<br />';
						break;
						case "GetFederalID":
							if(thisN1.IDCodeQualifier == "FI"){
								PartnerFederalID = thisN1.IDCode;
								document.getElementById('status').innerHTML += 'Extracted Federal ID from Plan Sponsor<br />';
							}else{
								document.getElementById('status').innerHTML += 'Unhandled partner code type, Aborting: ' + segment.toString() + '<br />';
								throw {};
							}
						break;
						default:
							document.getElementById('status').innerHTML += 'Unhandled segment type, Aborting: ' + segment.toString() + '<br />';
							throw {};
						break;
					}
				break;
				case "INS":
					let thisINS = new INSSeg(segment);
					console.dir(thisINS);
					//this starts and Insured Member Level Detail
					if(csvRow.Partner_Federal_ID){
						//write the csv row need to do this at the EOF too
						throw {};
					}
					csvRow = new CSVRow();
					console.dir(PartnerFederalID);
					csvRow.Partner_Federal_ID = PartnerFederalID;
					csvRow.Individual_Relationship_Code = thisINS.Individual_Relationship_Code;
					console.dir(csvRow);
				break;
				case "REF":
					let thisRef = new REFSeg(segment)
					thisRef.ReferenceDesc = ReferenceIDQualifierCodeDictionary[thisRef.ReferenceIDQualifier]
					console.dir(thisRef);
					switch(thisRef.ReferenceDesc){
						case "SubscriberNumber":
							csvRow.Subscriber_Employee_Number = thisRef.ReferenceValue;
						break;
						case "GroupOrPolicyNumber":
							csvRow.Member_Policy_Number = thisRef.ReferenceValue;
						break;
						default:
							document.getElementById('status').innerHTML += 'Unknown Reference type, Aborting: ' + segment.toString() + '<br />'
							throw{}
						break;
					}
					console.dir(csvRow);
				break;
				case "NM1":
					let thisNM1 = new NM1Seg(segment);
					thisNM1.EntityCodeDesc = EntityIdentfierCodeDictionay[thisNM1.EntityIDCode];
					console.dir(thisNM1);
					switch(thisNM1.EntityCodeDesc){
						case "InsuredOrSubscriber":
							csvRow.First_Name = thisNM1.MemberFirstName;
							csvRow.Last_Name = thisNM1.MemberLastName;
							csvRow.Middle_Name = thisNM1.MemberMiddleName;
						break;
						default:
							document.getElementById('status').innerHTML += 'Unknown NM1 identifier, Aborting: ' + segment.toString() + '<br />'
						break;
					}
					
					console.dir(csvRow);
				break;
				case "PER": //Contact type and detail, ie Home phone 555-123-4567 or Email user@company.tld
					let thisPER = new PERSeg(segment);
					thisPER.ContactFunctionDesc = ContactFunctionCodeDict[thisPER.ContactFunctionCode];
					thisPER.CommunicationDescription = CommunicationTypeQualifierDict[thisPER.CommunicationNumberQualifier];
					thisPER.CommunicationDescription2 = CommunicationTypeQualifierDict[thisPER.CommunicationNumberQualifier2];
					console.dir(thisPER);
					if(["Home","Cellular","Telephone","Work"].indexOf(thisPER.CommunicationDescription) > -1){
						csvRow.Phone_Number = thisPER.CommunicationNumber;
					}else if(["Home","Cellular","Telephone","Work"].indexOf(thisPER.CommunicationDescription2) > -1){
						csvRow.Phone_Number = thisPER.CommunicationNumber2;
					}
					console.dir(csvRow);
				break;
				case "N3": //street address
					let thisN3 = new N3Seg(segment);
					console.dir(thisN3);
					csvRow.Address_1 = thisN3.AddressLine1;
					csvRow.Address_2 = thisN3.AddressLine2;
					console.dir(csvRow);
				break;
				case "N4":// City state zip
					let thisN4 = new N4Seg(segment);
					console.dir(thisN4);
					csvRow.City = thisN4.City;
					csvRow.State = thisN4.State;
					csvRow.ZipCode = thisN4.PostalCode;
					console.dir(csvRow);
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