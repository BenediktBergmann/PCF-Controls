import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { senderEnum, openStrategyEnum } from "./helper/enums";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Conversation } from './tsx/Conversation';
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import { IMessageProps } from "./tsx/Message";
import { SpawnSyncOptionsWithBufferEncoding } from "child_process";

type DataSet = ComponentFramework.PropertyTypes.DataSet;

const RowRecordId: string = "rowRecId";

declare var Xrm: any;

const DataSetControl_LoadMoreButton_Hidden_Style = "DataSetControl_LoadMoreButton_Hidden_Style";

export class ConversationControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _context: ComponentFramework.Context<IInputs>;
	private _randomId: string;
	private _openStrategy: openStrategyEnum;
	private _modalWidth: number;
	private _useSubgridData: boolean;
	private _entityName: string;
	private _showEmptyMessages: boolean;

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

	// Button element created as part of this control
	private _loadPageButton: HTMLButtonElement;

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
		this._context = context;
		this._randomId = this.createId(7);

		this._textColumn = context.parameters.TextColumn.raw? context.parameters.TextColumn.raw : "";
		this._senderColumn = context.parameters.SenderColumn.raw? context.parameters.SenderColumn.raw : "";
		this._dateColumn = context.parameters.DateColumn.raw? context.parameters.DateColumn.raw : "";
		this._readColumn = context.parameters.ReadColumn.raw? context.parameters.ReadColumn.raw : "";
		this._publishedColumn = context.parameters.PublishedColumn.raw? context.parameters.PublishedColumn.raw : "";
		this._hasAttachmentColumn = context.parameters.HasAttachmentsColumn.raw? context.parameters.HasAttachmentsColumn.raw : "";
		this._customerIdentifyers = context.parameters.CustomerIdentifier.raw? context.parameters.CustomerIdentifier.raw.split(',') : [];

		let showScrollbar = false;
		if(context.parameters.ShowScrollbar!.raw == "Yes"){
			showScrollbar = true;
		}

		this._showEmptyMessages = false;
		if(context.parameters.ShowEmptyMessages!.raw == "Yes"){
			this._showEmptyMessages = true;
		}

		this._useSubgridData = false;
		if(context.parameters.UseSubgridData!.raw == "Yes"){
			this._useSubgridData = true;
		}
		this._entityName = context.parameters.EntityName!.raw? context.parameters.EntityName!.raw : "";

		this._openStrategy = openStrategyEnum.ModalCenter;
		if(context.parameters.OpenStrategy!.raw == openStrategyEnum.CurrentTab){
			this._openStrategy = openStrategyEnum.CurrentTab;
		} else if(context.parameters.OpenStrategy!.raw == openStrategyEnum.NewWindow){
			this._openStrategy = openStrategyEnum.NewWindow;
		} else if(context.parameters.OpenStrategy!.raw == openStrategyEnum.ModalRight){
			this._openStrategy = openStrategyEnum.ModalRight;
		}

		this._modalWidth = context.parameters.ModalWidth.raw? context.parameters.ModalWidth.raw : 50;

		let messageSentBgColor = context.parameters.SentMessageBgColor.raw? context.parameters.SentMessageBgColor.raw : "#e1ffc7";
		let messageSentTextColor = context.parameters.SentMessageTextColor.raw? context.parameters.SentMessageTextColor.raw : "#000000";
		let messageSentMetadataTextColor = context.parameters.SentMessageMetadataTextColor.raw? context.parameters.SentMessageMetadataTextColor.raw : "#888888";
		let messageSentReadCheckmarkColor = context.parameters.SentMessageReadCheckmarkColor.raw? context.parameters.SentMessageReadCheckmarkColor.raw : "#4fc3f7";
		let messageSentUnpublishedBgColor = context.parameters.SentMessageNotPublishedBgColor.raw? context.parameters.SentMessageNotPublishedBgColor.raw : "#f1ffe4";
		let messageSentUnpublishedTextColor = context.parameters.SentMessageNotPublishedTextColor.raw? context.parameters.SentMessageNotPublishedTextColor.raw : "#000000";
		let messageSentUnpublishedMetadataTextColor = context.parameters.SentMessageNotPublishedMetaDataTextColor.raw? context.parameters.SentMessageNotPublishedMetaDataTextColor.raw : "#888888";
		let messageReceivedBgColor = context.parameters.ReceivedMessageBgColor.raw? context.parameters.ReceivedMessageBgColor.raw : "#eeeeee";
		let messageReceivedTextColor = context.parameters.ReceivedMessageTextColor.raw? context.parameters.ReceivedMessageTextColor.raw : "#000000";
		let messageReceivedMetadataTextColor = context.parameters.ReceivedMessageMetadataTextColor.raw? context.parameters.ReceivedMessageMetadataTextColor.raw : "#888888";
		let maxHeight = context.parameters.MaxHeight.raw? context.parameters.MaxHeight.raw : "";

		container.appendChild(this.generateCustomStyle(this._randomId, showScrollbar, maxHeight, messageSentBgColor, messageSentTextColor, messageSentMetadataTextColor, messageSentReadCheckmarkColor, messageSentUnpublishedBgColor, messageSentUnpublishedTextColor, messageSentUnpublishedMetadataTextColor, messageReceivedBgColor, messageReceivedTextColor, messageReceivedMetadataTextColor));
		
		this._conversation = document.createElement("div");
		container.appendChild(this._conversation);

		this._loadPageButton = document.createElement("button");
		this._loadPageButton.setAttribute("type", "button");
		this._loadPageButton.innerText = context.resources.getString("LoadMore_ButtonLabel");
		this._loadPageButton.classList.add(DataSetControl_LoadMoreButton_Hidden_Style);
		this._loadPageButton.classList.add("DataSetControl_LoadMoreButton_Style");
		this._loadPageButton.addEventListener(
		  "click",
		  this.onLoadMoreButtonClick.bind(this)
		);
		
		container.appendChild(this._loadPageButton);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._context = context;
		this.toggleLoadMoreButtonWhenNeeded(context.parameters.dataSetGrid);
		if(!context.parameters.dataSetGrid.loading){

			if (!context.parameters.dataSetGrid.columns || !context.parameters.dataSetGrid.columns.some(function(columnItem: DataSetInterfaces.Column) { return columnItem.order >= 0})) {
				return;
			}

			this.generateConversation(context.parameters.dataSetGrid);
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
		this._loadPageButton.removeEventListener("click",this.onLoadMoreButtonClick);
	}

	/**
   * Row Click Event handler for the associated row when being clicked
   */
  	private onMessageClick(rowRecordId: string): void {
		if (rowRecordId) {
			let entityLogicalName = this._context.parameters.dataSetGrid.getTargetEntityType();

			if((this._openStrategy === openStrategyEnum.ModalCenter || this._openStrategy === openStrategyEnum.ModalRight) && typeof Xrm !== 'undefined'){
				let pageInput = {
					pageType: "entityrecord",
					entityName: entityLogicalName,
					formType: 2,
					entityId: rowRecordId
				};

				let navigationOptions = {
					target: 2,
					position: (this._openStrategy === openStrategyEnum.ModalRight? 2 : 1),
					width: {value: this._modalWidth, unit:"%"}
				};		
				
				(<any>Xrm).Navigation.navigateTo(pageInput, navigationOptions);
			} else{
				let entityFormOptions = {
					entityName: entityLogicalName,
					entityId: rowRecordId,
					openInNewWindow: (this._openStrategy === openStrategyEnum.NewWindow)
				};
				this._context.navigation.openForm(entityFormOptions);
			}
		}
	}
	
	private generateCustomStyle(controlId: string, showScrollbar: boolean, maxHeight: string, messageSentBgColor: string, messageSentTextColor: string, messageSentMetadataTextColor: string, messageSentReadCheckmarkColor: string, messageSentUnpublishedBgColor: string, messageSentUnpublishedTextColor: string, messageSentUnpublishedMetadataTextColor:string, messageReceivedBgColor: string, messageReceivedTextColor: string, messageReceivedMetadataTextColor: string) : HTMLStyleElement{
		let style = document.createElement("style");

		if(showScrollbar){
			style.innerHTML = "div.BeBeControls div#" + controlId + ".conversation { overflow-y: scroll; }";
		} else if(maxHeight && maxHeight !== "" && maxHeight !== null) {
			style.innerHTML = "div.BeBeControls div#" + controlId + ".conversation { max-height: " + maxHeight + "; }";
		}

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.published { color: " + messageSentTextColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.published .metadata { color: " + messageSentMetadataTextColor +"; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.published { background: " + messageSentBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.published:after { border-color: transparent transparent transparent " + messageSentBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.notPublished { color: " + messageSentUnpublishedTextColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.notPublished .metadata { color: " + messageSentUnpublishedMetadataTextColor +"; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.notPublished { background: " + messageSentUnpublishedBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.notPublished:after { border-color: transparent transparent transparent " + messageSentUnpublishedBgColor + "; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.sent.read .metadata .checkmarks{ color:" + messageSentReadCheckmarkColor + "; }";
		
		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.received { background: " + messageReceivedBgColor + "; color: " + messageReceivedTextColor +"; }";

		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.received .metadata { color: " + messageReceivedMetadataTextColor +"; }";
		
		style.innerHTML += " div.BeBeControls div#" + controlId + ".conversation .message.received:after { border-color: transparent " + messageReceivedBgColor + " transparent transparent; }";

		return style;
	}

	private generateConversation(messages: DataSet){
		if(this._useSubgridData)
		{
			let messagesArray: IMessageProps[] = [];

			for(let currentRecordId of messages.sortedRecordIds){
				messagesArray.push(this.generateIMessagePropFromEntity(messages.records[currentRecordId]));
			}

			this.renderConversation(messagesArray);
		} else if(!this._useSubgridData && this._entityName != ""){
			let activityId = (<any>this._context.mode).contextInfo.entityId;			

			if(activityId){
				// store reference to 'this' so it can be used in the callback method
				var thisRef = this;

				let outerFetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' >" +
										"<entity name='" + this._entityName + "' >" +
											"<attribute name='regardingobjectid' />" +
											"<filter>" +
												"<condition attribute='activityid' operator='eq' value='" + activityId + "' />" +
											"</filter>" +
										"</entity>" +
									"</fetch>";


				this._context.webAPI
				.retrieveMultipleRecords(thisRef._entityName, "?fetchXml=" + outerFetchXml)
				.then(
					function(response: ComponentFramework.WebApi.RetrieveMultipleResponse) {
						let regardingObjectId = response.entities[0]['_regardingobjectid_value'];

						thisRef.fetchDataFromWebAPI(regardingObjectId);
					},
					function(errorResponse: any) {
						let messagesArray: IMessageProps[] = [];
						thisRef.renderConversation(messagesArray);
					}
				);
			} else if(!activityId && typeof Xrm !== 'undefined'){
				let regardingObjectId = "";
				let regardingObjectAttribute = (<any>Xrm).Page.getAttribute("regardingobjectid");
				if(typeof regardingObjectAttribute !== 'undefined' && regardingObjectAttribute !== null){
					let regardingObjectValue = (<any>Xrm).Page.getAttribute("regardingobjectid").getValue();
					if(typeof regardingObjectValue !== 'undefined' && regardingObjectValue !== null){
						regardingObjectId = regardingObjectValue[0]["id"].toString();
						regardingObjectId = regardingObjectId.substr(1, regardingObjectId.length - 2);
					}
				}

				if(regardingObjectId !== ""){
					this.fetchDataFromWebAPI(regardingObjectId);
				} else {
					let messagesArray: IMessageProps[] = [];
					this.renderConversation(messagesArray);
				}
			}else {
				let messagesArray: IMessageProps[] = [];
				this.renderConversation(messagesArray);
			}
		} else {
			this.renderConversation([], this._context.resources.getString("Wrong_Configuration"))
		}
	}

	private fetchDataFromWebAPI(regardingObjectId: string){
		//Create FetchXML for sub grid to filter records based on GUID
		let innerFetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' >" +
								"<entity name='" + this._entityName + "' >" +
								"<attribute name='activityid' />" +
								"<attribute name='" + this._textColumn + "' />" +
								"<attribute name='" + this._senderColumn + "' />";

		innerFetchXml += (typeof this._dateColumn !== 'undefined' && this._dateColumn)?"<attribute name='" + this._dateColumn + "' />" : "<attribute name='createdon' />";
		innerFetchXml += (typeof this._hasAttachmentColumn !== 'undefined' && this._hasAttachmentColumn)?"<attribute name='" + this._hasAttachmentColumn + "' />" : "";
		innerFetchXml += (typeof this._readColumn !== 'undefined' && this._readColumn)?"<attribute name='" + this._readColumn + "' />" : "";
		innerFetchXml += (typeof this._publishedColumn !== 'undefined' && this._publishedColumn)?"<attribute name='" + this._publishedColumn + "' />" : "";
		innerFetchXml += 		"<filter>" +
									"<condition attribute='regardingobjectid' operator='eq' value='" + regardingObjectId + "' />" +
								"</filter>";
		innerFetchXml += (typeof this._dateColumn !== 'undefined' && this._dateColumn)?"<order attribute='" + this._dateColumn + "' />" : "<order attribute='createdon' />";
		innerFetchXml += "</entity>" +
						"</fetch>";

		let thisRef = this;
		this._context.webAPI
		.retrieveMultipleRecords(this._entityName, "?fetchXml=" + innerFetchXml)
		.then(
			function(response: ComponentFramework.WebApi.RetrieveMultipleResponse) {
				let messagesArray: IMessageProps[] = [];
				for(let entity of response.entities){
					messagesArray.push(thisRef.generateIMessagePropFromODataEntity(entity));
				}
				thisRef.renderConversation(messagesArray);
			},
			function(errorResponse: any) {
				let messagesArray: IMessageProps[] = [];
				thisRef.renderConversation(messagesArray);
			}
		);
	}

	private renderConversation(messages: IMessageProps[], message:string = ""){
		ReactDOM.render(
			React.createElement(
				Conversation,
				{
					messages: messages,
					randomId: this._randomId,
					noRecordsText: message !== ""? message : this._context.resources.getString("No_Record_Found"),
					showEmptyMessages: this._showEmptyMessages,
					currentRecordId: (<any>this._context.mode).contextInfo.entityId,
					onClick: this.onMessageClick.bind(this)
				}
			),
			this._conversation
		);
	}

	private generateIMessagePropFromEntity(rawMessage: DataSetInterfaces.EntityRecord): IMessageProps{
		let message : IMessageProps;

		let recordId = rawMessage.getRecordId();
		let text = rawMessage.getFormattedValue(this._textColumn);
		let sender = (this._customerIdentifyers.includes(rawMessage.getValue(this._senderColumn).toString()))? senderEnum.Customer : senderEnum.User;
		let createDate = (typeof this._dateColumn !== 'undefined' && this._dateColumn !== "") ? rawMessage.getFormattedValue(this._dateColumn) : "";
		let hasAttachments = (typeof this._hasAttachmentColumn !== 'undefined' && this._hasAttachmentColumn !== "" && rawMessage.getValue(this._hasAttachmentColumn) === "1")? true : false;

		let read = false;
		if(typeof this._readColumn === 'undefined' ||
			this._readColumn === "" || 
			(this._readColumn !== "" && rawMessage.getValue(this._readColumn) !== null)){
			read = true;
		}

		let published = false;
		if(typeof this._publishedColumn === 'undefined' ||
			this._publishedColumn === "" || 
			(this._publishedColumn !== "" && rawMessage.getValue(this._publishedColumn) !== null)){
			published = true;
		}

		message = {recordId: recordId, text: text, sender: sender, published: published, createDate: createDate, read: read, hasAttachments: hasAttachments};

		return message;
	}

	private generateIMessagePropFromODataEntity(rawMessage: ComponentFramework.WebApi.Entity): IMessageProps{
		let oDataFormatedValueSuffix = "@OData.Community.Display.V1.FormattedValue";

		let message : IMessageProps;
		
		let recordId = rawMessage['activityid'];
		let text = rawMessage[this._textColumn];
		let sender = (this._customerIdentifyers.includes(rawMessage[this._senderColumn].toString()))? senderEnum.Customer : senderEnum.User;
		let createDate = (typeof this._dateColumn !== 'undefined' && this._dateColumn !== "") ? rawMessage[this._dateColumn + oDataFormatedValueSuffix] : "";
		let hasAttachments = (typeof this._hasAttachmentColumn !== 'undefined' && this._hasAttachmentColumn !== "" && typeof rawMessage[this._hasAttachmentColumn] !== 'undefined' && rawMessage[this._hasAttachmentColumn].toString() === "1")? true : false;

		let read = false;
		if(typeof this._readColumn === 'undefined' ||
			this._readColumn === "" || 
			(this._readColumn !== "" && typeof rawMessage[this._readColumn] !== 'undefined' && rawMessage[this._readColumn] !== null)){
			read = true;
		}

		let published = false;
		if(typeof this._publishedColumn === 'undefined' ||
			this._publishedColumn === "" || 
			(this._publishedColumn !== "" && typeof rawMessage[this._publishedColumn] !== 'undefined' && rawMessage[this._publishedColumn] !== null)){
			published = true;
		}

		message = {recordId: recordId, text: text, sender: sender, published: published, createDate: createDate, read: read, hasAttachments: hasAttachments};

		return message;
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

	  /**
	 * 'LoadMore' Button Event handler when load more button clicks
	 * @param event
	 */
	private onLoadMoreButtonClick(event: Event): void {
		this._context.parameters.dataSetGrid.paging.loadNextPage();
		this.toggleLoadMoreButtonWhenNeeded(this._context.parameters.dataSetGrid);
	}

	 /**
	 * Toggle 'LoadMore' button when needed
	 */
	private toggleLoadMoreButtonWhenNeeded(gridParam: DataSet): void {
		if(this._useSubgridData){
			if (
				gridParam.paging.hasNextPage &&
				this._loadPageButton.classList.contains(
					DataSetControl_LoadMoreButton_Hidden_Style
				)
			) {
				this._loadPageButton.classList.remove(
					DataSetControl_LoadMoreButton_Hidden_Style
				);
			} else if (
				!gridParam.paging.hasNextPage &&
				!this._loadPageButton.classList.contains(
					DataSetControl_LoadMoreButton_Hidden_Style
				)
			) {
				this._loadPageButton.classList.add(
					DataSetControl_LoadMoreButton_Hidden_Style
				);
			}
		} else {
			if(!this._loadPageButton.classList.contains(DataSetControl_LoadMoreButton_Hidden_Style)){
				this._loadPageButton.classList.add(
					DataSetControl_LoadMoreButton_Hidden_Style
				);
			}
		}
	}
}