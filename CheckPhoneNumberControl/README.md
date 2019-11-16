# Check Phone Number Control
## Purpose
A Control that checks if the given string is a correct phone number. You can chonfigure which country codes should be accepted.
The Source you can download here is translated in English and Swedish.

## Download
You can download the last release [here](https://github.com/BenediktBergmann/PCF-Controls/releases).

## Example
![Configuration](/CheckPhoneNumberControl/Screenshots/Configuration.png)
![CorrectSSSN](/CheckPhoneNumberControl/Screenshots/Correct.png)
![IncorrectSSSN](/CheckPhoneNumberControl/Screenshots/Incorrect.png)

## Configuration
Configuration | Description | Required
------------ | ------------- | -------------
Allowed CC | Comma seperated list of allowed country codes. You can find a description of possible values here: https://www.npmjs.com/package/libphonenumber-js#country-code | 

## Improvements/New Functions
- [ ] Optimize the check of swedish numbers.
- [ ] Show indicator besides Inputfield.

## Used Libraries
- [libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js) ([License](https://github.com/catamphetamine/libphonenumber-js/blob/HEAD/LICENSE))
