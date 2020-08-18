# Conversation Control
## Purpose
A Control that shows a list of Entities (SubGrid) in a user friendly conversation style.
The Source you can download here is translated in English, Swedish and German.

## Download
You can download the last release [here](https://github.com/BenediktBergmann/PCF-Controls/releases).

## Example
![Configuration](/ConversationControl/Screenshots/Configuration.png)
![Display](/ConversationControl/Screenshots/Display.png)

## Configuration
Configuration | Description | Required | Default value
------------ | ------------- | ------------- | -------------
TextColumn | Name of the field that contains the text that should be shown | X |
SenderColumn | Name of field that identifies the sender | X |
CustomerIdentifier | Komma separated list of value ids (values of the optionSet which is configured as "SenderColumn") that identify the sender as the customer | X |
DateColumn | Name of the field that contains the date that should be shown | |
ReadColumn | Name of field that identifies whether the sent message was read | |
PublishedColumn | Name of field to identify whether the sent message was published | |
HasAttachmentsColumn | Name of field that indicates whether the message contains attachments | |
HasErrorsColumn | Name of field that indicates whether the message has errors | |
ShowScrollbar | Defines whether to show a scrollbar beside the control | |
Maxheight | The maximal height the control (inner conversation container) should have. Has to be a valid css value (for example "300px" or "50%"). Will only be used when a scrollbar should be shown. |  |
OpenStrategy | Dropdown of different possibilities on how to open messages. | X | Modal Center
ModalWidth | The procentual width the modal should have | | 50
ShowEmptyMessages | Defines whether to show empty messages | X | No
SentMessageBgColor | Background color for sent messages | | #e1ffc7
SentMessageTextColor | Text color for sent messages | | #000000
SentMessageMetadataTextColor | Text color for the metadata of sent messages | | #888888
SentMessageReadCheckmarkColor | Color for checkmarks when sent message was read by the customer | | #4fc3f7
SentMessageHasErrorBgColor | Background color for sent messages with errors | | #960f00
SentMessageHasErrorTextColor | Text color for sent messages with errors | | #000000
SentMessageHasErrorMetadataTextColor | Text color for the metadata of sent messages with errors | | #888888
SentMessageNotPublishedBgColor | Beackground color for sent messages that are not published yet | | #f1ffe4
SentMessageNotPublishedTextColor | Text color for sent messages that are not published yet | | #000000
SentMessageNotPublishedMetadataTextColor | Text color for the metadata of sent messages that are not published yet | | #888888
ReceivedMessageBgColor | Background color for received messages | | #eeeeee
ReceivedMessageTextColor | Text color for received messages | | #000000
ReceivedMessageMetadataTextColor | Text color for the metadata of received messages | | #888888
UseSubgridData | Defines whether the Control should use the data of the Subgrid or load it seperately. Can be used if the usual Subgrid is not able to provide correct data (for example: On the message form the conversation (all messages related to the case) should be shown). Only works with acitvities at the moment. | X | Yes
EntityName | Name of the activity entity that should be loaded when the "UseSubgridData" configuration is "No". | | 

I wrote a blog post to explain how to configure the control. You can find it [here](https://benediktbergmann.eu/2020/05/23/pcf-use-conversationcontrol/).

## Improvements/New Functions
- [X] "No records found" message
- [X] "Load more" button
- [X] Add configuration to open messages in modal
- [X] Use React
- [ ] Read & Published either date or two options
- [ ] HTML encoding of text
- [ ] Add Pagination
- [ ] Start at the last page
- [ ] Load next page when reaching top/bottom
- [ ] If it is the same entity we should scroll to current record
- [ ] Date separator (inkl. Only showing time on message)
- [ ] Optional sorting
- [ ] Style Scrollbar
- [ ] Possibility to use different Entities in the List
- [ ] Different Conversation styles
