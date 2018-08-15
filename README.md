<p>This module takes payload and validate them against rules list.</p>

You can apply the following rules in each key of your payload. 
* `REQUIRED`
* `IS_STRING`
* `NOT_EMPTY`
* `IS_NUMBER`
* `IS_NUMBER`
* `IS_ARRAY`
* `IS_BOOLEAN`
* `IS_EMAIL`
* `LENGTH` (min,max)

## How to define validation rules

Consider a sample payload


```console
{
    "employee": {  
	"id": 964464646324,
        "name": "Bob Williams",   
        "salary":  "567899",   
        "married": true,
	"phone": "9876446111",
	"email": "bob.williams@email.com"
    }  
}
```

Let's say we want to apply some rules on each field of the payload, we can define rules as below.

```console
let validateRules={
  "employee.id":      ["REQUIRED","IS_NUMBER"],
  "employee.name":    ["REQUIRED",{name:"LENGTH",min:5,max:"50"},"IS_STRING"],
  "employee.salary":  ["REQUIRED",{name:"LENGTH",min:5,max:50}],
  "employee.married": ["REQUIRED","IS_BOOLEAN"],
  "employee.phone":   ["REQUIRED",{name:"LENGTH",min:5,max:"50"}],
  "employee.email":   ["REQUIRED",{name:"LENGTH",min:5,max:"50"},,'IS_EMAIL']
}
```

## How to use library 
```console
let Validator = require('./index');

let validatorObj=new Validator();

let validateRules=<YOUR_RULES_OBJECT>;

let payload=<YOUR_PAYLOAD>;

let response=validatorObj.validate(validateRules,payload);
```

This validate function gives an `object` as a response .

#### Success Case
```console
{
   "status":"Success",
   "message":"Payload is valid"
}
```

#### Error Case
```console
{
   "status":"Error",
   "message":[
      {
         "field":"employee.salary",
         "message":"Field length is not matching the criteria"
      }
   ]
}
```
