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
TextColumn | Name of text field | X |
SenderColumn | Name of field that identifies the sender | X |
DateColumn | Name of dat field that should be shown | |
ReadColumn | Name of field that identifies whether the sent message was read | |
PublishedColumn | Name of field to identify whether the sent message was published | |
HasAttachmentsColumn | Name of field that indicates whether the message contains attachments | |
CustomerIdentifier | Komma separated list of value ids (values of the optionSet which is configured as "SenderColumn") that identify the sender as the customer | X |
Maxheight | The maximal height the control (inner conversation container) should have. | X | 300
SentMessageBgColor | Background color for sent messages |  | #e1ffc7
SentMessageTextColor | Text color for sent messages |  | #000000
SentMessageMetadataTextColor | Text color for the metadata of sent messages |  | #888888
SentMessageReadCheckmarkColor | Color for checkmarks when sent message was read by the customer |  | #4fc3f7
SentMessageNotPublishedBgColor | Beackground color for sent messages that are not published yet |  | #f1ffe4
SentMessageNotPublishedTextColor | Text color for sent messages that are not published yet |  | #000000
SentMessageNotPublishedMetadataTextColor | Text color for the metadata of sent messages that are not published yet |  | #888888
ReceivedMessageBgColor | Background color for received messages |  | #eeeeee
ReceivedMessageTextColor | Text color for received messages |  | #000000
ReceivedMessageMetadataTextColor | Text color for the metadata of received messages |  | #888888

## Improvements/New Functions
- [X] "No records found" message
- [X] "Load more" button
- [X] Add configuration to open messages in modal
- [ ] Read & Published either date or two options
- [ ] HTML encoding of text
- [ ] Add Pagination
- [ ] Start at the last page
- [ ] Load next page when reaching top/bottom
- [ ] Date separator (inkl. Only showing time on message)
- [ ] Optional sorting
- [ ] Style Scrollbar
- [ ] Possibility to use different Entities in the List