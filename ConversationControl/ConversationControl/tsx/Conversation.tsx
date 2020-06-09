import * as React from "react";
import {Message, IMessageProps} from "./Message"

export interface IConversationProps {
    messages: IMessageProps[],
    randomId: string,
    noRecordsText: string,
    showEmptyMessages: boolean,
    onClick: (recordId: string) => void
}

export class Conversation extends React.Component<IConversationProps> {
    public render() {
        if(this.props.messages.length > 0){
            return (
                <div id={this.props.randomId} className="conversation">
                    {this.props.messages.map(({recordId, text, sender, published, createDate, read, hasAttachments}) => {
                        if(this.props.showEmptyMessages || (!this.props.showEmptyMessages && text !== "" && text !== null && typeof text !== 'undefined')){
                            return <Message key={recordId} recordId={recordId} text={text} sender={sender} published={published} createDate={createDate} read={read} hasAttachments={hasAttachments} onClick={this.props.onClick} />
                        }
                    })}
                </div>
            )
        } else {
            return(
                <div id={this.props.randomId} className="conversation no-records">
                    <i className="ms-Icon ms-Icon--TextDocument"></i>
                    <div>
                        {this.props.noRecordsText}
                    </div>
                </div>
            )
        }
    }
}