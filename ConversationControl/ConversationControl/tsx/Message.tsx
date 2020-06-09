import * as React from "react";
import { senderEnum } from "../helper/enums";

export interface IMessageProps {
    recordId: string,
    text: string,
    sender: senderEnum,
    published: boolean,
    createDate: string,
    read: boolean,
    hasAttachments: boolean,
    onClick?: (recordId: string) => void
}

export class Message extends React.Component<IMessageProps> {
    public render() {
        let hasAttachments;
        if(this.props.hasAttachments){
            hasAttachments = <i className="ms-Icon ms-Icon--Attach"></i>;
        }

        let checkMarks;
        if(this.props.sender === senderEnum.User && this.props.published){
            checkMarks = <span className="checkmarks">
                <i className="ms-Icon ms-Icon--StatusCircleCheckmark"></i>
                <i className="ms-Icon ms-Icon--StatusCircleCheckmark"></i>
            </span>;
        }

        return (
            <div key={this.props.recordId} className={this.generateMessageCssClasses()} onClick={() => this.props.onClick? this.props.onClick(this.props.recordId) : {}}>
                <p>{this.props.text}</p>
                <span className="metadata">
                    <span className="createDate">
                        {this.props.createDate}
                    </span>
                    {hasAttachments}
                    {checkMarks}
                </span>
            </div>
        );
    }

    generateMessageCssClasses(): string{
        let cssClasses = ["message"];
        
        if(this.props.sender === senderEnum.User){
            cssClasses.push("sent");
        
            if(this.props.published){
                cssClasses.push("published");
        
                if(this.props.read){
                    cssClasses.push("read");
                }
            }
            else {
                cssClasses.push("notPublished");
            }
        }
        else {
            cssClasses.push("received");
        }

        return cssClasses.join(" ");
    }
}