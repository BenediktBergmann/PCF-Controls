# Check Phone Number Control
## Purpose
A Control that checks if the given string is a correct phone number. You can chonfigure which country codes should be accepted.
The Source you can download here is translated in English, Swedish and German.

## Download
You can download the last release [here](https://github.com/BenediktBergmann/PCF-Controls/releases).

## Example
![Configuration2](/CheckPhoneNumberControl/Screenshots/Configuration.png)
![CorrectSSSN](/CheckPhoneNumberControl/Screenshots/Correct.png)
![IncorrectSSSN](/CheckPhoneNumberControl/Screenshots/Incorrect.png)

## Configuration
Configuration | Description | Required
------------ | ------------- | -------------
Format | The Format the phone number should be transformed to. International (+46 70 712 34 56), National (070-712 34 56) or E164 (+46707123456) | X
Default CC | The Default country code. |
Allowed CC | Comma separated list of allowed country codes. | 
Excluded CC | Comma separated list of excluded country codes. | 
Allowed Type | Comma separated list of allowed number types. |
Excluded Type | Comma separated list of excluded number types. |

### Possible Country Codes
ISO 3166 (alpha 2) country codes needs to be used. You can find a list of possible values here: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes

### Possible Types
You can find a list of possible values here: https://www.npmjs.com/package/awesome-phonenumber#phone-number-types

## Improvements/New Functions
- [X] Optimize the check of swedish numbers.
- [X] Add possibility to exclude country codes.
- [X] Add default country code.
- [X] Choose Format between International, National or E164.
- [X] Add possibility to only allow certain phone number types. For example: Mobile or fixed line.
- [ ] Show indicator besides Inputfield.

## Used Libraries
- [awesome-phonenumber](https://www.npm.red/package/awesome-phonenumber)
