# Nordic SSN Control
## Purpose
A Control that checks if the given string is a correct Nordic (swedish or finnish) Social Security Number (Personnummer). You can choose whether it accepts swedish SSN's, swedish Coordination numbers (Samordningsnummer), finnish PIC's or all of them.
The Control will accept numbers in the following syntax: YYYYMMDD-NNNC.
The Source you can download here is translated in English and Swedish.

## Download
You can download the last release [here](https://github.com/BenediktBergmann/PCF-Controls/releases).

## Example
![Configuration](/SwedishSSNControl/Screenshots/Configuration.png)
![CorrectSSSN](/SwedishSSNControl/Screenshots/Correct.png)
![IncorrectSSSN](/SwedishSSNControl/Screenshots/Incorrect.png)

## Configuration
Configuration | Description | Required | Default
------------ | ------------- | ------------- | -------------
Input Valid | Related true/false field that indicates whether the entered input is valid. Can be used to prevent saving the form if not valid |
Allow Swedish Social Security number | Decides whether or not the swedish Social Security Number is allowed as an input | X | Yes
Allow Swedish Coordination number | Decides whether or not the swedish Coordination Number is allowed as an input | X | Yes 
Allow Finnish Personal Identity code | Decides whether or not the finnish personal identity code is allowed as an input | X | No

## Improvements/New Functions
- [ ] Check agains Bisnode/Navet/Spar whether the given (and correct) SSSN exists in the system.
- [ ] Show indicator besides Inputfield.
- [ ] Add Norwegian SSN as possible input
- [X] Add Finnish SSN as possible input
- [ ] Add Danish SSN as possible input
- [ ] Show country flag
- [X] Add possibility to configure which countries are allowed
- [X] Rename to "Nordic SSN Control"
- [ ] Translate to NO, FI, DNK
