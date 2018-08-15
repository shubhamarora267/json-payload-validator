'use strict';

var validator = require('validator');

class Validator  {

	constructor() {
			this.VALIDATION_LIST=this.getValidationList();
			this.fieldErrorList=[];
	}

	getValidationList(){
		return {
			REQUIRED: {
				function:'isRequired',
				errorMessage: 'Field is required'
			},
			IS_STRING: {
				function:'isString',
				errorMessage: 'Field should be a string'
			},
			NOT_EMPTY: {
				function:'notEmpty',
				errorMessage: 'Field should not be empty'
			},
			IS_NUMBER:{
				function:'isNumber',
				errorMessage: 'Field should be a number'
			},
			IS_ARRAY: {
				function:'isArray',
				errorMessage: 'Field should be an array'
			},
			IS_BOOLEAN: {
				function:'isBoolean',
				errorMessage: 'Field should be boolean value true/false'
			},
			IS_EMAIL: {
				function:'isEmail',
				errorMessage: 'Field should be an email'
			},
			LENGTH:{
				function: 'length',
				errorMessage: 'Field length is not matching the criteria',
				requiredKeys: ['min','max']
			}
		};
	}

	getErrorMessage(rule){
		return this.VALIDATION_LIST[rule]['errorMessage'];
	}

	getRuleFunction(rule){
		return this[this.VALIDATION_LIST[rule]['function']];
	}

	getFunctionRequiredKey(rule){
		return this.VALIDATION_LIST[rule]['requiredKeys'];
	}

	isValidStringRule(rule){
		return this.VALIDATION_LIST[rule] ? true : false;
	}

	array_diff(arr1,arr2) {
	    return arr1.filter(function(i) {return arr2.indexOf(i) < 0;});
	}

	isValidObjectRule(rule){
		// Rule name is not passed as a parameter
		if(!rule.name){
			return {isValid: false, message: 'name parameter is missing in rule.'};
		}
		// Rule is missing in VALIDATION_LIST
		if(!this.VALIDATION_LIST[rule.name]){
			return {isValid: false, message: ` ${rule.name} is not a valid rule`};
		}
		// Check if all the required keys are present
		if(this.getFunctionRequiredKey(rule.name).length){
			let diff=this.array_diff(this.getFunctionRequiredKey(rule.name),Object.keys(rule));
			if(diff.length){
				return {isValid: false, message: `Rule ${rule.name} has missing key(s) " ${diff.join()} " `};
			}
		}
		return {isValid: true };
	}

	isRequired(ruleArray){
		let isRequired;
		isRequired = ruleArray.findIndex((ele)=>{
			return ele==='REQUIRED';
		});
		return (isRequired!='-1')?true:false;
	}

	isString(value){
		return (typeof value=="string" ? true: false);//validator.isAlphanumeric(value);
	}

	notEmpty(value){
		return value?true:false;
	}

	isNumber(value){
		if(typeof value=="number"){
			return true;
		}else{
			return validator.isNumeric(value);
		}
	}

	isArray(value){
		return Array.isArray(value);
	}
	
	isBoolean(value){
		if(typeof value=="boolean"){
			return true;
		}else{
			return validator.isBoolean(value);
		}
	
	}
	
	isEmail(value){
		return validator.isEmail(value);		
	}
	
	length(value,min,max){
		if(typeof value=="object"){
			return false;
		}else if(value.toString().length >= parseInt(min) && value.length <= parseInt(max)){
			return true;
		}else{
			return false;
		}
	}


	jumpToPath(keyPath, payload){
		let tempPayload=payload;
		let pathArray=keyPath.split('.');
		for(let i=0; i < pathArray.length; i++){
			tempPayload=tempPayload[pathArray[i]];
			if(tempPayload=== undefined){
				break;
			}
		}
		if(tempPayload=== undefined){
			return false;
		}
		return tempPayload;
	}


	validate(rules, payload){
		// Check if rules and payload both are objects
		if(typeof rules == "object"){
			if(typeof payload == "object"){
				return this.validatePayload(rules,payload);
			}else{
				return `Payload should be an object`;
			}
		}else{
			return `Validation Rules should be an object`;
		}
	}

	validatePayload(rules,payload){
		let fieldErrors=[],isRequired=false,keyPresent,fieldRes=false;
		// Loop through each rule
		for (let fieldPath in rules) {
			// validate for every field from Rules List
			fieldRes=this.validateField(payload,fieldPath,rules[fieldPath]);
		}

		if(	this.fieldErrorList.length){
			return 	{
				status : "Error",
				message : this.fieldErrorList
			};
		}else{
			return {
				status : "Success",
				message : "Payload is valid"
			};
		}
	}


	validateField(payload,fieldPath,fieldRules){
		let isRequired=false,keyPresent,fieldError=false;
		if(!Array.isArray(fieldRules)){
			this.fieldErrorList.push({field: fieldPath , message:'Validations are not defined as array'});
			fieldError=true;
		}else{
			let value=this.jumpToPath(fieldPath,payload);
			// Key is not present
			if(!value && this.isRequired(fieldRules)) {
					this.fieldErrorList.push({field: fieldPath , message: this.getErrorMessage('REQUIRED')});
			}else{
				for(let i=0; i < fieldRules.length; i++){
					fieldError=this.applyRule(fieldPath,fieldRules[i],value);
					if(fieldError){
						break;
					}
				} // end of for loop
			}
		}
		return fieldError;
	}

	applyRule(fieldPath, fieldRule, value){
		let fieldError=false;
		if(typeof fieldRule == "string" && fieldRule!='REQUIRED'){
			return this.applyStringRule(fieldPath,fieldRule,value);
		}else if(typeof fieldRule == "object"){
			return this.applyObjectRule(fieldPath,fieldRule,value);
		}
	}

	applyStringRule(fieldPath, fieldRule, value){
		let fieldError;
		if(this.isValidStringRule(fieldRule)){
			let result=this.getRuleFunction(fieldRule)(value);
			if(!result){
				this.fieldErrorList.push({field: fieldPath , message: this.getErrorMessage(fieldRule)});
			}
		}else{
			fieldError=true;
			this.fieldErrorList.push({field: fieldPath , message: ` ${fieldRule} is not a valid rule`});
		}
		return fieldError;
	}

	applyObjectRule(fieldPath, fieldRule, value){
		let fieldError=false,isValid={};
		if(!fieldRule.name){
			this.fieldErrorList.push({field: fieldPath , message: ` ${fieldRule} name key is missing`});
			fieldError=true;
		}else{
			isValid=this.isValidObjectRule(fieldRule);
			if(isValid.isValid){
				let func=this.getRuleFunction(fieldRule.name);
				let params=[value];
				this.getFunctionRequiredKey(fieldRule.name).forEach((key)=> params.push(fieldRule[key]));
				let result=func(...params);
				if(!result){
					this.fieldErrorList.push({field: fieldPath , message: this.getErrorMessage(fieldRule.name)});
					fieldError=true;
				}
			}else{
				fieldError=true;
				this.fieldErrorList.push({field: fieldPath , message: isValid.message});
			}
		}
		return fieldError;
	}

} // end of class
module.exports = Validator;
