import * as React from "react";
import { senderEnum } from "../helper/enums";

export interface IMessageProps {
    recordId: string,
    text: string,
    sender: senderEnum,
    senderName: string,
    published: boolean,
    createDate: string,
    read: boolean,
    hasAttachments: boolean,
    hasError: boolean,
    renderHTML?: boolean,
    onClick?: (recordId: string) => void
}

export class Message extends React.PureComponent<IMessageProps> {
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
                {this.props.senderName !== "" && this.props.senderName !== null && this.props.senderName !== undefined &&
                    <div className="sender">
                        {this.props.senderName}
                    </div>
                }
                {this.props.renderHTML
                    ? <p dangerouslySetInnerHTML={{__html: this.props.text}}></p>
                    : <p>{this.props.text}</p>
                }
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

            if(this.props.hasError){
                cssClasses.push("hasError")
            }
        }
        else {
            cssClasses.push("received");
        }

        return cssClasses.join(" ");
    }
}