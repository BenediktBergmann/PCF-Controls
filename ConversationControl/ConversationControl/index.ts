import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

const enum senderEnum {
	Customer,
	User
}

const RowRecordId: string = "rowRecId";

export class ConversationControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;

	//Column variables
	private _textColumn: string;
	private _senderColumn: string;
	private _dateColumn: string;
	private _readColumn: string;
	private _publishedColumn: string;
	private _hasAttachmentColumn: string;
	private _customerIdentifyers: string[];

	// HTML container
	private _conversation: HTMLDivElement;

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this._notifyOutputChanged = notifyOutputChanged;
		this._context = context;

		/*this._textColumn = "description";
		this._senderColumn = "bebe_sender";
		this._createDateColumn = "createdon";
		this._readDateColumn = "bebe_readbycustomer";
		this._publishDateColumn = "bebe_publishdate";
		this._hasAttachmentColumn = "bebe_filesattached";
		this._customerIdentifyers = ["136980000"];
		*/
		this._textColumn = context.parameters.TextColumn.raw? context.parameters.TextColumn.raw : "";
		this._senderColumn = context.parameters.SenderColumn.raw? context.parameters.SenderColumn.raw : "";
		this._dateColumn = context.parameters.DateColumn.raw? context.parameters.DateColumn.raw : "";
		this._readColumn = context.parameters.ReadColumn.raw? context.parameters.ReadColumn.raw : "";
		this._publishedColumn = context.parameters.PublishedColumn.raw? context.parameters.PublishedColumn.raw : "";
		this._hasAttachmentColumn = context.parameters.HasAttachmentsColumn.raw? context.parameters.HasAttachmentsColumn.raw : "";
		this._customerIdentifyers = context.parameters.CustomerIdentifier.raw? context.parameters.CustomerIdentifier.raw.split(',') : [];

		this._conversation = document.createElement("div");
		this._conversation.classList.add("conversation");

		//This will be used to scope the variable colors. To be able to use different colors when the control is used several times on the same page.
		let randomId = this.createId(8);
		this._conversation.setAttribute("id", randomId);

		let messageSentBgColor = context.parameters.SentMessageBgColor.raw? context.parameters.SentMessageBgColor.raw : "#e1ffc7";
		let messageSentUnpublishedBgColor = context.parameters.SentMessageNotPublishedBgColor.raw? context.parameters.SentMessageNotPublishedBgColor.raw : "#f1ffe4";
		let messageSentTextColor = context.parameters.SentMessageTextColor.raw? context.parameters.SentMessageTextColor.raw : "#000000";
		let messageSentMetadataTextColor = context.parameters.SentMessageMetadataTextColor.raw? context.parameters.SentMessageMetadataTextColor.raw : "#888888";
		let messageSentReadCheckmarkColor = context.parameters.SentMessageReadCheckmarkColor.raw? context.parameters.SentMessageReadCheckmarkColor.raw : "4fc3f7";
		let messageReceivedBgColor = context.parameters.ReceivedMessageBgColor.raw? context.parameters.ReceivedMessageBgColor.raw : "#eeeeee";
		let messageReceivedTextColor = context.parameters.ReceivedMessageTextColor.raw? context.parameters.ReceivedMessageTextColor.raw : "#000000";
		let messageReceivedMetadataTextColor = context.parameters.ReceivedMessageMetadataTextColor.raw? context.parameters.ReceivedMessageMetadataTextColor.raw : "#888888";
		let maxHeight = context.parameters.MaxHeight.raw? context.parameters.MaxHeight.raw : 300;

		container.appendChild(this.generateCustomStyle(randomId, maxHeight, messageSentBgColor, messageSentUnpublishedBgColor, messageSentTextColor, messageSentMetadataTextColor, messageSentReadCheckmarkColor, messageReceivedBgColor, messageReceivedTextColor, messageReceivedMetadataTextColor));

		container.appendChild(this._conversation);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._context = context;
		if(!context.parameters.dataSetGrid.loading){
				
			// Get sorted columns on View
			let columnsOnView = this.getSortedColumnsOnView(context);

			if (!columnsOnView || columnsOnView.length === 0) {
				return;
			}

			this.createConversation(context.parameters.dataSetGrid);
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	/**
   * Row Click Event handler for the associated row when being clicked
   * @param event
   */
	private onMessageClick(event: Event): void {
		
		let rowRecordId = (event.currentTarget as HTMLDivElement).getAttribute(
			RowRecordId
		);
		if (rowRecordId) {
			let entityLogicalName = this._context.parameters.dataSetGrid.getTargetEntityType();
			let entityFormOptions = {
				entityName: entityLogicalName,
				entityId: rowRecordId
			};
			this._context.navigation.openForm(entityFormOptions);
		}
	}

	/**
	 * Get sorted columns on view
	 * @param context 
	 * @return sorted columns object on View
	 */
	private getSortedColumnsOnView(context: ComponentFramework.Context<IInputs>): DataSetInterfaces.Column[]
	{
		if (!context.parameters.dataSetGrid.columns) {
			return [];
		}
		
		let columns = context.parameters.dataSetGrid.columns
			.filter(function (columnItem:DataSetInterfaces.Column) { 
				// some column are supplementary and their order is not > 0
				return columnItem.order >= 0 }
			);
		
		// Sort those columns so that they will be rendered in order
		columns.sort(function (a:DataSetInterfaces.Column, b: DataSetInterfaces.Column) {
			return a.order - b.order;
		});
		
		return columns;
	}

	private createConversation(messages: DataSet){
		this.clearContainer();

		if(messages.sortedRecordIds.length > 0)
		{
			for(let currentRecordId of messages.sortedRecordIds){
				let recordId = messages.records[currentRecordId].getRecordId();
				let text = messages.records[currentRecordId].getFormattedValue(this._textColumn);
				let sender = (this._customerIdentifyers.includes(messages.records[currentRecordId].getValue(this._senderColumn).toString()))? senderEnum.Customer : senderEnum.User;
				let date = (typeof this._dateColumn !== 'undefined' && this._dateColumn !== "") ? messages.records[currentRecordId].getFormattedValue(this._dateColumn) : "";
				let hasAttachment = (typeof this._hasAttachmentColumn !== 'undefined' && this._hasAttachmentColumn !== "" && messages.records[currentRecordId].getValue(this._hasAttachmentColumn) === "1")? true : false;

				let read = false;
				if(typeof this._readColumn === 'undefined' ||
				  this._readColumn === "" || 
				  (this._readColumn !== "" && messages.records[currentRecordId].getValue(this._readColumn) !== null)){
					read = true;
				}

				let published = false;
				if(typeof this._publishedColumn === 'undefined' ||
				  this._publishedColumn === "" || 
				  (this._publishedColumn !== "" && messages.records[currentRecordId].getValue(this._publishedColumn) !== null)){
					published = true;
				}
				debugger;

				this.generateMessage(recordId, text, sender, published, date, read, hasAttachment);
			}
		}
	}

	private clearContainer(){
		this._conversation.innerHTML = "";
	}

	private generateMessage(recordId: string, text: string, sender: senderEnum, published: boolean, createDate: string, read: boolean, hasAttachments: boolean){
		let messageContainer = document.createElement("div");

		// Set the recordId on the row dom
        messageContainer.setAttribute(
			RowRecordId,
			recordId
		);

		messageContainer.addEventListener("click", this.onMessageClick.bind(this));

		messageContainer.classList.add("message");
		if(sender === senderEnum.User){
			messageContainer.classList.add("sent");

			if(published){
				messageContainer.classList.add("published");

				if(read){
					messageContainer.classList.add("read");
				}
			}
			else {
				messageContainer.classList.add("notPublished");
			}
		}
		else {
			messageContainer.classList.add("received");
		}

		let message = document.createElement("p");
		message.innerHTML = text;

		let metadata = document.createElement("span");
		metadata.classList.add("metadata");
		let creatDate = document.createElement("span");
		creatDate.classList.add("createDate");
		creatDate.innerHTML = createDate;

		metadata.appendChild(creatDate)

		if(hasAttachments){
			let attachment = document.createElement("i");
			attachment.classList.add("ms-Icon");
			attachment.classList.add("ms-Icon--Attach");

			metadata.appendChild(attachment);
		}

		if(sender === senderEnum.User && published){
			let checkmarks = document.createElement("span");
			checkmarks.classList.add("checkmarks");
			let firstCheckmark = document.createElement("i");
			firstCheckmark.classList.add("ms-Icon");
			firstCheckmark.classList.add("ms-Icon--StatusCircleCheckmark");
			checkmarks.appendChild(firstCheckmark);
			let secondCheckmark = document.createElement("i");
			secondCheckmark.classList.add("ms-Icon");
			secondCheckmark.classList.add("ms-Icon--StatusCircleCheckmark");
			checkmarks.appendChild(secondCheckmark);

			metadata.appendChild(checkmarks);
		}

		messageContainer.appendChild(message);
		messageContainer.appendChild(metadata);
		this._conversation.appendChild(messageContainer);
	}

	private generateCustomStyle(controlId: string, maxHeight: number, messageSentBgColor: string, messageSentUnpublishedBgColor: string, messageSentColor: string, messageSentMetadataColor: string, messageSentReadCheckmarkColor: string, messageReceivedBgColor: string, messageReceivedColor: string, messageReceivedMetadataColor: string) : HTMLStyleElement{
		let style = document.createElement("style");

		style.innerHTML = "div.BeBeControls div#" + controlId + ".conversation { max-height: " + maxHeight + "px; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent { color: " + messageSentColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent .metadata { color: " + messageSentMetadataColor +"; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.published { background: " + messageSentBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.published:after { border-color: transparent transparent transparent " + messageSentBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.notPublished { background: " + messageSentUnpublishedBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.notPublished:after { border-color: transparent transparent transparent " + messageSentUnpublishedBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.read .metadata .checkmarks{ color:" + messageSentReadCheckmarkColor + "; }";
		
		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.received { background: " + messageReceivedBgColor + "; color: " + messageReceivedColor +"; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.received .metadata { color: " + messageReceivedMetadataColor +"; }";
		
		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.received:after { border-color: transparent " + messageReceivedBgColor + " transparent transparent; }";

		return style;
	}

	private createId(length: number) {
		let result = '';
		let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		let charactersLength = characters.length;
		for ( let i = 0; i < length; i++ ) {
		   result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	 }
}