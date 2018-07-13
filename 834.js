/**
 * The goal is to process 834 files for now. Considerations to advance it to process other HL7 files in the future.
 * TODO:
 * 		1) load up the code to description dictionaries for each segment type so I don't have to rely on known codes
 * 		2) improve thrown aborting errors
 * 		3) make variable names consistent style
 * 
 * 
 * immediate to do:
 *		-use the input filename to generate the output file
 *		-take a pause here and there so the page can get updated
 */
const detailedConsole = false;

let ISA = class{ // Interchange Control Headers
	constructor(segString){
		//defined string lengths, ex:ISA*00*          *00*          *ZZ*260302465      *01*MEMD           *180627*0540*^*00501*000000033*0*P*:~
		//```````````````````````````000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111
		//```````````````````````````000000000011111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000
		//```````````````````````````012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
		/////////////////////////////ISA*00*          *00*          *30*860836639      *ZZ*Navitus        *180628*1032*^*00501*000067173*0*P*~:
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
	this.SegmentElementSeparator = segString.substring(105,106)
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
		this.FormattedDate = "";
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
		this.Employment_Status_Code = segArray.length > 8?segArray[8]:"";
		this.Student_Status_Code = segArray.length > 9?segArray[9]:"";//Not Used, only defined by spec
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
		this.MemberMiddleName = segArray.length > 5?segArray[5]:"";
		this.NamePrefix = segArray[6];
		this.NameSuffix = segArray[7];
		this.IDCodeQualifier = segArray[8];
		this.MemberId = segArray[9];
		this.EntityCodeDesc = "";
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
		this.ContactFunctionDesc = "";
		this.CommunicationDescription = "";
		this.CommunicationDescription2 = "";
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

let DMGSeg = class{ //base demographics
	constructor(segString){
		let segArray = segString.split('*');
		this.DTPFormat = segArray[1];
		this.DOB = segArray[2];
		this.GenderCode = segArray[3]; //Standards are only (M)ale, (F)emale, and (U)nknown
		this.MaritalStatus = segArray[4];
		this.MaritalStatusDesc = "";
	}
}

let HDSeg = class{
	constructor(segString){
		let segArray = segString.split('*');
		this.MaintenanceTypeCode = segArray[1];
		this.MaintenanceReasonCode = segArray[2];
		this.InsuranceLineCode = segArray[3];
		this.PlanCoverageDescription = segArray[4];
		this.CoverageLevelCode = segArray[5];
		this.MaintenanceTypeDesc = "";
		this.InsuranceLineDesc = "";
	}
}
let CSVRow = class{
	constructor(){
		this.Partner_Federal_ID = "";
		this.Individual_Relationship_Code = "";
		this.Employment_Status_Code = "";
		this.Student_Status_Code = "";
		this.Subscriber_Employee_Number = "";
		this.Member_Policy_Number = "";
		this.Entity_Organization = "";
		this.Group_Policy = "";
		this.Last_Name = "";
		this.First_Name = "";
		this.Middle_Name = "";
		this.Phone_Number = "";
		this.Email_Address = "";
		this.Address_1 = "";
		this.Address_2 = "";
		this.City = "";
		this.State = "";
		this.ZipCode = "";
		this.DOB = "";
		this.Gender = "";
		this.Plan_Coverage_Description = "";
		this.Eligibility_Begin_Date = "";
		this.Eligibility_End_Date = "";
		this.Benefit_Start = "";
		this.Benefit_End = "";
	}
}

const ReferenceIDQualifierCodeDictionary = {
	"0F" : "SubscriberNumber",
	"1L" : "GroupOrPolicyNumber",
	"23" : "ClientNumber",
	"38" : "MasterPolicyNumber",
	"6O" : "CrossReferenceNumber", //That's 6 O as in Oscar, not the number 60
	"DX" : "DepartmentOrAgencyNumber",
	"F6" : "HealthInsuranceClaimNumber",
	"SY" : "SocialSecurityNumber",
	"ZZ" : "MutuallyDefined"
}

const N1CodeDictionary = {
	"P5" : {
		"description"	: "Plan Sponsor",
		"action"		: "GetFederalID"
	},
	"IN" : {
		"description"	: "Insurer",
		"action"		: "skip"
	},
	"TV" :{
		"description"	: "ThirdPartyAdministrator",
		"action"		: "skip"
	}
	
}

const DTPCodeDictionary = {
	"007" : "Effective", //Date, effective date.
	"303" : "MaintenanceEffective",
	"382" : "EnrollmentFile",
	"336" : "EmploymentBegin",
	"337" : "EmploymentEnd",
	"338" : "MedicareBegin",
	"339" : "MedicareEnd",
	"340" : "COBRABegin",
	"341" : "COBRAEnd",
	"348" : "BenefitBegin",
	"349" : "BenefitEnd",
	"356" : "EligibilityBegin",
	"357" : "EligibilityEnd"
}

const EntityIdentfierCodeDictionay = {//NM1 segment
	"IL" : "InsuredOrSubscriber",
	"P3" : "PrimaryCareProvider"
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

const MaritalStatusCodeDict = { //this dictionary should also be complete to spec
	"A" : "CommonLaw",
	"B" : "RegisteredDomesticParner",
	"C" : "NotApplicable",
	"D" : "Divorced",
	"I" : "Single",
	"K" : "Unknown",
	"M" : "Married",
	"R" : "Unreported",
	"S" : "Separated",
	"U" : "Unmarried", //make no assumption, this can include sigle, divorced, widowed, etc
	"W" : "Widowed",
	"X" : "LegallySeparated"
}

const MaintenanceTypeCodeDict = {
	"001" : "Change",
	"002" : "Delete",
	"021" : "Addition",
	"024" : "CancellationOrTermination",
	"025" : "Reinstatement",
	"026" : "Correction",
	"030" : "Audit",
	"032" : "EmployeeInfoNotApplicable"
}

const InsuranceLineCodeDict = {
	"AG"  : "PreventativeCareWellness",
	"AH"  : "24HourCare",
	"AJ"  : "MedicareRisk",
	"AK"  : "MentalHealth",
	"DCP" : "DentalCapitation",
	"DEN" : "Dental",
	"EPO" : "ExclusiveProviderOrganization",
	"FAC" : "Facility",
	"HE"  : "Hearing",
	"HLT" : "Health",
	"HMO" : "HealthMaintenanceOrganization",
	"LTC" : "Long-TermCare",
	"LTD" : "Long-TermDisability",
	"MM"  : "MajorMedical",
	"MOD" : "MailOrderDrug",
	"PDG" : "PrescriptionDrug",
	"POS" : "PointOfService",
	"PPO" : "PreferredProviderOrganization",
	"PRA" : "Practitioners",
	"STD" : "Short-TermDisability",
	"UR"  : "UtilizationReview",
	"VIS" : "Vision"
}

let outText='"Partner_Federal_ID","Individual_Relationship_Code","Employment_Status_Code","Student_Status_Code","Subscriber_Employee_Number","Member_Policy_Number","Entity_Organization","Group_Policy","Last_Name","First_Name","Middle_Name","Phone_Number","Email_Address","Address_1","Address_2","City","State","ZipCode","DOB","Gender","Plan_Coverage_Description","Eligibility_Begin_Date","Eligibility_End_Date","Benefit_Start","Benefit_End"\n';

function convertFile(evt){
	var inFile = evt.target.files[0];
	var fileReader = new FileReader();

	fileReader.onload = function(evt){
		let segmentSeparator = evt.target.result.substring(105,106);
		let segmentRegex = new RegExp(segmentSeparator + '\\r?\\n?');
		let arr834 = evt.target.result.split(segmentRegex);
		let csvRow = new CSVRow();
		let i = 0;
		let j = 1;
		let k = 0;
		let partialFileWritten = false;
		let breakloop = false;
		document.getElementById('status').innerHTML += 'There are ' + arr834.length + ' segments.<br />Processing segment: <span id="dispSegCount"></span><br>Processed subscriber: <span id="dispSubCount"></span><br />'

		function processSegment(arr834,i){
			document.getElementById('dispSegCount').innerHTML = (i+1);
			let segment = arr834[i];
			if(segment.length>3){//not sure what a good sane number is here
				let type = segment.split("*")[0];
				switch(type){
					case "ISA" : //Interchange Control Header
						detailedConsole && console.log('processing ISA header');
						let thisISA = new ISA(segment);
						detailedConsole && console.dir(thisISA);
						document.getElementById('status').innerHTML += 'ISA header ignored.<br />';
					break;
					case "GS":
						let thisGS = new GS(segment);
						detailedConsole && console.dir(thisGS);
						document.getElementById('status').innerHTML += 'GS header ignored.<br />';
					break;
					case "ST":
						detailedConsole && console.log('processing ST header');
						let thisST = new ST(segment);
						detailedConsole && console.dir(thisST);
						document.getElementById('status').innerHTML += 'Cheking Set Type... ';
						
						if(thisST.TransactionSetIDCode != 834){
							document.getElementById('status').innerHTML += '834 not found. Abandoning process.';
							breakloop = true;
						}else{
							document.getElementById('status').innerHTML += '834 found, continuing<br />';
							detailedConsole && console.log('File type is good');
						}
					break;
					case "BGN":
						let thisBGN = new BGN(segment);
						detailedConsole && console.dir(thisBGN);
						document.getElementById('status').innerHTML += 'BGN header ignored.<br />';
					break;
					case "DTP":
						let thisDTP = new DTP(segment);
						thisDTP.QualifierDesc = DTPCodeDictionary[thisDTP.Qualifier];
						thisDTP.FormattedDate = dateFromString(thisDTP.DTPString,thisDTP.Format,"MM/DD/YY");
						detailedConsole && console.dir(thisDTP);
						switch(thisDTP.QualifierDesc){
							case "EnrollmentFile":
								document.getElementById('status').innerHTML += 'Enrollment file DTP ignored.<br />';
							break;
							case "EmploymentBegin":
							case "EmploymentEnd":
							case "Effective":
							case "MaintenanceEffective":
							case "COBRABegin":
							case "COBRAEnd":
							case "MedicareBegin":
							case "MedicareEnd":
								//ignore
							break;
							case "BenefitBegin":
								csvRow.Benefit_Start = thisDTP.FormattedDate;
							break;
							case "BenefitEnd":
								csvRow.Benefit_End = thisDTP.FormattedDate;
							break;
							case "EligibilityBegin":
								csvRow.Eligibility_Begin_Date = thisDTP.FormattedDate;
							break;
							case "EligibilityEnd":
								csvRow.Eligibility_End_Date = thisDTP.FormattedDate;
							break;
							default:
								document.getElementById('status').innerHTML += 'Unknown DTP type, Aborting: ' + segment.toString() + '<br />'
								breakloop = true;
							break;
						}
						if(thisDTP.QualifierDesc == "EnrollmentFile"){
							document.getElementById('status').innerHTML += 'Enrollment file DTP ignored.<br />';
						}
					break;
					case "N1":
						let thisN1 = new Entity(segment);
						if(typeof N1CodeDictionary[thisN1.EntityIDCode] == 'undefined'){
							document.getElementById('status').innerHTML += 'N1 Code not in dictionary, Aborting: ' + segment.toString() + '<br />';
							breakloop = true;
							break;
						}
						thisN1.EntityAction = N1CodeDictionary[thisN1.EntityIDCode].action;
						thisN1.EntityIDDesc = N1CodeDictionary[thisN1.EntityIDCode].description;
						detailedConsole && console.dir(thisN1);
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
									breakloop = true;
								}
							break;
							default:
								document.getElementById('status').innerHTML += 'Unhandled segment type, Aborting: ' + segment.toString() + '<br />';
								breakloop = true;
							break;
						}
					break;
					case "INS":
						let thisINS = new INSSeg(segment);
						detailedConsole && console.dir(thisINS);
						//this starts and Insured Member Level Detail
						if(csvRow.Partner_Federal_ID){
							outText += writeRow(csvRow);
							partialFileWritten = false;
							document.getElementById('dispSubCount').innerHTML = k+1;
							k++;
						}
						csvRow = new CSVRow();
						detailedConsole && console.dir(PartnerFederalID);
						csvRow.Partner_Federal_ID = PartnerFederalID;
						csvRow.Individual_Relationship_Code = thisINS.Individual_Relationship_Code;
						csvRow.Employment_Status_Code = thisINS.Employment_Status_Code;
						csvRow.Student_Status_Code = thisINS.Student_Status_Code;
						detailedConsole && console.dir(csvRow);
					break;
					case "REF":
						let thisRef = new REFSeg(segment)
						thisRef.ReferenceDesc = ReferenceIDQualifierCodeDictionary[thisRef.ReferenceIDQualifier]
						detailedConsole && console.dir(thisRef);
						switch(thisRef.ReferenceDesc){
							case "SubscriberNumber":
								csvRow.Subscriber_Employee_Number = thisRef.ReferenceValue;
							break;
							case "GroupOrPolicyNumber":
								csvRow.Member_Policy_Number = thisRef.ReferenceValue;
							break;
							case "SocialSecurityNumber":
								if(csvRow.Subscriber_Employee_Number.length < 2){
									csvRow.Subscriber_Employee_Number = thisRef.ReferenceValue;
								}
							break;
							case "DepartmentOrAgencyNumber":
								csvRow.Entity_Organization = thisRef.ReferenceValue;
							break;
							case "MutuallyDefined":
								csvRow.Group_Policy = thisRef.ReferenceValue;
							break;
							case "MasterPolicyNumber": 
							case "CrossReferenceNumber":
							case "HealthInsuranceClaimNumber":
							case "ClientNumber":
								//silent ignore
							break;
							default:
								document.getElementById('status').innerHTML += 'Unknown Reference type, Aborting: ' + segment.toString() + '<br />'
								breakloop = true;
							break;
						}
						detailedConsole && console.dir(csvRow);
					break;
					case "NM1":
						let thisNM1 = new NM1Seg(segment);
						thisNM1.EntityCodeDesc = EntityIdentfierCodeDictionay[thisNM1.EntityIDCode];
						detailedConsole && console.dir(thisNM1);
						switch(thisNM1.EntityCodeDesc){
							case "InsuredOrSubscriber":
								csvRow.First_Name = thisNM1.MemberFirstName;
								csvRow.Last_Name = thisNM1.MemberLastName;
								csvRow.Middle_Name = thisNM1.MemberMiddleName;
							break;
							case "PrimaryCareProvider":
								//silent ignore
							break;
							default:
								document.getElementById('status').innerHTML += 'Unknown NM1 identifier, Aborting: ' + segment.toString() + '<br />'
								breakloop = true;
							break;
						}
						
						detailedConsole && console.dir(csvRow);
					break;
					case "PER": //Contact type and detail, ie Home phone 555-123-4567 or Email user@company.tld
						let thisPER = new PERSeg(segment);
						thisPER.ContactFunctionDesc = ContactFunctionCodeDict[thisPER.ContactFunctionCode];
						thisPER.CommunicationDescription = CommunicationTypeQualifierDict[thisPER.CommunicationNumberQualifier];
						thisPER.CommunicationDescription2 = CommunicationTypeQualifierDict[thisPER.CommunicationNumberQualifier2];
						detailedConsole && console.dir(thisPER);
						if(["Home","Cellular","Telephone","Work"].indexOf(thisPER.CommunicationDescription) > -1){
							csvRow.Phone_Number = thisPER.CommunicationNumber;
						}else if(["Home","Cellular","Telephone","Work"].indexOf(thisPER.CommunicationDescription2) > -1){
							csvRow.Phone_Number = thisPER.CommunicationNumber2;
						}
						if(thisPER.CommunicationDescription == "EMail"){
							csvRow.Email_Address = thisPER.CommunicationNumber
						}
						if(thisPER.CommunicationDescription2 == "EMail"){
							csvRow.Email_Address = thisPER.CommunicationNumber2
						}
						detailedConsole && console.dir(csvRow);
					break;
					case "N3": //street address
						let thisN3 = new N3Seg(segment);
						detailedConsole && console.dir(thisN3);
						csvRow.Address_1 = thisN3.AddressLine1;
						csvRow.Address_2 = thisN3.AddressLine2;
						detailedConsole && console.dir(csvRow);
					break;
					case "N4":// City state zip
						let thisN4 = new N4Seg(segment);
						detailedConsole && console.dir(thisN4);
						csvRow.City = thisN4.City;
						csvRow.State = thisN4.State;
						csvRow.ZipCode = thisN4.PostalCode;
						detailedConsole && console.dir(csvRow);
					break;
					case "DMG": //Demographic
						let demographic = new DMGSeg(segment);
						demographic.MaritalStatusDesc = MaritalStatusCodeDict[demographic.MaritalStatus];
						detailedConsole && console.dir(demographic);
						detailedConsole && console.dir(dateFromString(demographic.DOB,demographic.DTPFormat));
						csvRow.DOB = dateFromString(demographic.DOB,demographic.DTPFormat,"MM/DD/YY");
						csvRow.Gender = demographic.GenderCode;
						detailedConsole && console.dir(csvRow);
					break;
					case "HD":
						let planInfo = new HDSeg(segment);
						planInfo.MaintenanceTypeDesc = MaintenanceTypeCodeDict[planInfo.MaintenanceTypeCode];
						planInfo.InsuranceLineDesc = InsuranceLineCodeDict[planInfo.InsuranceLineCode];
						detailedConsole && console.dir(planInfo);
						if(planInfo.InsuranceLineDesc == "Health"){
							csvRow.Plan_Coverage_Description = planInfo.PlanCoverageDescription;
						}
						detailedConsole && console.dir(csvRow);
					break;
					case "SE":
						document.getElementById('status').innerHTML += 'SE footer ignored.<br />';
					break;
					case "GE":
						//currently ignored
						document.getElementById('status').innerHTML += 'GE footer ignored.<br />';
					break;
					case "IEA":
						document.getElementById('status').innerHTML += 'IEA footer ignored.<br />';
					break;
					case "ICM":
					case "LX"://line counter.... not yet sure what this is for
					case "QTY": //quantity, could be usefull but doesn't seem like it provided reliably
					case "COB"://coordination of benefits
						//silent ignore
					break;
					default:
						document.getElementById('status').innerHTML += 'Unknown segment type, Aborting: ' + segment.toString() + '<br />'
						breakloop = true;
					break;
				}
			}

			//there seems to be a max size of things, so let's break up large files: currently breaks up on segments processed, maybe it should on rows written?
			if(k % 5000 == 0 && i>0 && k>0){
				//write what we have so far to a file:
				if(!partialFileWritten){
					var hiddenElement = document.createElement('a');
					hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(outText);
					hiddenElement.innerHTML = "Part " + j + ": Click here if download did not start automatically"
					hiddenElement.target = '_self';
					hiddenElement.download = document.getElementById('fileInput').files[0].name + 'part' + j + '.csv';
					hiddenElement.click();
					document.getElementById('status').appendChild(hiddenElement);
					document.getElementById('status').innerHTML += '<br />'
					outText='"Partner_Federal_ID","Individual_Relationship_Code","Employment_Status_Code","Student_Status_Code","Subscriber_Employee_Number","Member_Policy_Number","Entity_Organization","Group_Policy","Last_Name","First_Name","Middle_Name","Phone_Number","Email_Address","Address_1","Address_2","City","State","ZipCode","DOB","Gender","Plan_Coverage_Description","Eligibility_Begin_Date","Eligibility_End_Date","Benefit_Start","Benefit_End"\n';
					j++;
					partialFileWritten = true;
				}
			}

			i++;
			if(!breakloop && i<arr834.length){
				setTimeout(processSegment,0,arr834,i);
			}else if(!breakloop){
				//processed successfully
				outText += writeRow(csvRow);
				var hiddenElement = document.createElement('a');
				hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(outText);
				
				hiddenElement.target = '_self';
				if(j > 1){
					hiddenElement.innerHTML = "Part " + j + ": Click here if download did not start automatically"
					hiddenElement.download = document.getElementById('fileInput').files[0].name + 'part' + j + '.csv';
				}else{
					hiddenElement.innerHTML = "Click here if download did not start automatically"
					hiddenElement.download = document.getElementById('fileInput').files[0].name + '.csv';
				}
				hiddenElement.click();
				document.getElementById('status').appendChild(hiddenElement);
				document.getElementById('status').innerHTML += '<br />'
			}
		}
		if(i<arr834.length){
			setTimeout(processSegment,0,arr834,i);
		}
	}
	fileReader.readAsText(inFile);
	document.getElementById('status').innerHTML += 'File read into system.<br />'
}

function dateFromString(dateString, dateFormatCode,outputformat = "JS"){
	let dateTime = null;
	if(typeof dateString == 'undefined' || dateString.length == 0){
		return "";
	}else{
		switch(dateFormatCode){
			case "D8": //CCYYMMDD
				dateTime = new Date(dateString.substr(0,4),parseInt(dateString.substr(4,2),10)-1,dateString.substr(6,2));
			break;
			case "DT": //CCYYMMDDHHMM
				dateTime = new Date(dateString.substr(0,4),parseInt(dateString.substr(4,2),10)-1,dateString.substr(6,2),dateString.substr(8,2),dateString.substr(10,2));
			break;
			case "RD8": //CCYYMMDD-CCYYMMDD  this is a date range
				//Not sure if I need to worry about this one yet.
				console.dir('Unhandled date as range');
				throw {}
			break;
			case "TM"://HHMM
				dateTime = new Date(0,0,1,dateString.substr(0,2),dateString.substr(2,2));
			break;
		}
		switch(outputformat){
			case "MM/DD/YY":
				return "" + (parseInt(dateTime.getMonth())+1) + "/" + dateTime.getDate() + "/" + dateTime.getFullYear().toString().substr(2,2); 
			break;
			case "JS":
			default:
				return dateTime;
			break;
		}
	}
}

function writeRow(rowToWrite){
	let outText = "";
	
	outText += '"' + rowToWrite.Partner_Federal_ID + '"';
	outText += ',"' + rowToWrite.Individual_Relationship_Code + '"';
	outText += ',"' + rowToWrite.Employment_Status_Code + '"';
	outText += ',"' + rowToWrite.Student_Status_Code + '"';
	outText += ',"' + rowToWrite.Subscriber_Employee_Number + '"';
	outText += ',"' + rowToWrite.Member_Policy_Number + '"';
	outText += ',"' + rowToWrite.Entity_Organization + '"';
	outText += ',"' + rowToWrite.Group_Policy + '"';
	outText += ',"' + rowToWrite.Last_Name + '"';
	outText += ',"' + rowToWrite.First_Name + '"';
	outText += ',"' + rowToWrite.Middle_Name + '"';
	outText += ',"' + rowToWrite.Phone_Number + '"';
	outText += ',"' + rowToWrite.Email_Address + '"';
	outText += ',"' + rowToWrite.Address_1 + '"';
	outText += ',"' + rowToWrite.Address_2 + '"';
	outText += ',"' + rowToWrite.City + '"';
	outText += ',"' + rowToWrite.State + '"';
	outText += ',"' + rowToWrite.ZipCode + '"';
	outText += ',"' + rowToWrite.DOB + '"';
	outText += ',"' + rowToWrite.Gender + '"';
	outText += ',"' + rowToWrite.Plan_Coverage_Description + '"';
	outText += ',"' + rowToWrite.Eligibility_Begin_Date + '"';
	outText += ',"' + rowToWrite.Eligibility_End_Date + '"';
	outText += ',"' + rowToWrite.Benefit_Start + '"';
	outText += ',"' + rowToWrite.Benefit_End + '"\n';

	return outText;
}