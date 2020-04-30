# Swedish SSN Control
## Purpose
A Control that checks if the given string is a correct Swedish Social Security Number (Personnummer). You can choose whether it accepts swedish SSN's, swedish Coordination numbers (Samordningsnummer) or both.
The Control will accept numbers in the following syntax: YYYYMMDD-NNNC.
The Source you can download here is translated in English and Swedish.

## Download
You can download the last release [here](https://github.com/BenediktBergmann/PCF-Controls/releases).

## Example
![Configuration](/SwedishSSNControl/Screenshots/Configuration.png)
![CorrectSSSN](/SwedishSSNControl/Screenshots/Correct.png)
![IncorrectSSSN](/SwedishSSNControl/Screenshots/Incorrect.png)

## Configuration
Configuration | Description | Required
------------ | ------------- | -------------
Input Valid | Related true/false field that indicates whether the entered input is valid. Can be used to prevent saving the form if not valid |
Allow Social Security number | Decides whether or not the Social Security Number is allowed as an input | X
Allow Coordination number | Decides whether or not the Coordination Number is allowed as an input | X

## Improvements/New Functions
- [ ] Check agains Bisnode/Navet/Spar whether the given (and correct) SSSN exists in the system.
- [ ] Show indicator besides Inputfield.
- [ ] Add Norwegian SSN as possible input
- [ ] Add Finnish SSN as possible input
- [ ] Add Danish SSN as possible input
- [ ] Show country flag
- [ ] Add possibility to configure which countries are allowed
- [ ] Rename to "Nordic SSN Control"
- [ ] Translate to NO, FI, DNK
