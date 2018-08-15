'use strict';


let Validator = require('./index');

let validatorObj=new Validator();

let validateRules={
  "employee.id": ["REQUIRED","IS_NUMBER"],
  "employee.name": ["REQUIRED",{name:"LENGTH",min:5,max:"50"},"IS_STRING"],
  "employee.salary": ["REQUIRED",{name:"LENGTH",min:5,max:50}],
  "employee.married": ["REQUIRED","IS_BOOLEAN"],
  "employee.phone": ["REQUIRED",{name:"LENGTH",min:5,max:"50"}],
  "employee.email": ["REQUIRED",{name:"LENGTH",min:5,max:"50"},,'IS_EMAIL']
};

let payload={
    "employee": {  
		"id": 964464646324,
        "name":       "Bob Williams",   
        "salary":      "567899",   
        "married":    true,
		"phone": "9876446111",
		"email": "bob.williams@email.com"
    }  
};
console.log(validatorObj.validate(validateRules,payload));