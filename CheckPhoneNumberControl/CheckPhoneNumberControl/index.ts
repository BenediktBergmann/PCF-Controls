import {IInputs, IOutputs} from "./generated/ManifestTypes";
var PhoneNumber = require( 'awesome-phonenumber' );

declare var Xrm: any;

export class CheckPhoneNumberControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;

	private _inputElementOnChange: EventListenerOrEventListenerObject;
	private _inputElementOnFocus: EventListenerOrEventListenerObject;
	private _inputElementOnFocusOut: EventListenerOrEventListenerObject;

	private _iconElementOnMouseenter: EventListenerOrEventListenerObject;
	private _iconElementOnMouseleave: EventListenerOrEventListenerObject;
	private _iconElementOnClick: EventListenerOrEventListenerObject;

	private _value: string;
	private _defaultCC: string;
	private _allowedCC: string[];
	private _excludedCC: string[];
	private _allowedTypes: string[];
	private _excludedTypes: string[];
	private _emptyValue = "---";
	private _maskValue = "******";
	private _numberValidReturnValue = false;
	private _openQuickCreate = false;
	//private _fieldIsRequired = false;
	private _clickToCall = "";

	private _outputFormat: string;

	// HTML container
	private _container: HTMLDivElement;
	private _inputElement: HTMLInputElement;
	private _iconElement: HTMLSpanElement;
	// label element created as part of this control
	private _errorContainer: HTMLDivElement;
	private _errorLabelElement: HTMLLabelElement;

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

		this._defaultCC = "";
		this._allowedCC = [];
		this._excludedCC = [];
		this._allowedTypes = [];
		this._excludedTypes = [];

		this._outputFormat = context.parameters.outputFormat.raw.toLocaleLowerCase();

		if(context.parameters.defaultCC.raw != null && context.parameters.defaultCC.raw != "" && context.parameters.defaultCC.raw.indexOf(',') == -1){
			this._defaultCC = context.parameters.defaultCC.raw.trim().toUpperCase();
		}

		if(context.parameters.allowedCC.raw != null && context.parameters.allowedCC.raw != ""){
			this._allowedCC = context.parameters.allowedCC.raw.split(',');
			this._allowedCC = this._allowedCC.map(el => el.trim().toUpperCase());
		}

		if(context.parameters.excludedCC.raw != null && context.parameters.excludedCC.raw != ""){
			this._excludedCC = context.parameters.excludedCC.raw.split(',');
			this._excludedCC = this._excludedCC.map(el => el.trim().toUpperCase());
		}

		if(context.parameters.allowedType.raw != null && context.parameters.allowedType.raw != ""){
			this._allowedTypes = context.parameters.allowedType.raw.split(',');
			this._allowedTypes = this._allowedTypes.map(el => el.trim().toLowerCase());
		}

		if(context.parameters.excludedType.raw != null && context.parameters.excludedType.raw != ""){
			this._excludedTypes = context.parameters.excludedType.raw.split(',');
			this._excludedTypes = this._excludedTypes.map(el => el.trim().toLowerCase());
		}

		this._clickToCall = context.parameters.clickToCallType.raw;

		if(this._clickToCall === "custom" && context.parameters.customClickToCallType.raw != null && context.parameters.customClickToCallType.raw != ""){
			this._clickToCall = context.parameters.customClickToCallType.raw;
		}

		let showButton = false;

		if(context.parameters.showButton!.raw == "Yes"){
			showButton = true;
		}

		if(context.parameters.openQuickCreate!.raw == "Yes"){
			this._openQuickCreate = true;
		}

		this._inputElementOnChange = this.inputOnChange.bind(this);
		this._inputElementOnFocus = this.inputOnFocus.bind(this);
		this._inputElementOnFocusOut = this.inputOnFocusOut.bind(this);
		this._iconElementOnMouseenter = this.inputAddHighlightClass.bind(this);
		this._iconElementOnMouseleave = this.inputRemoveHighlightClass.bind(this);
		this._iconElementOnClick = this.handleButtonClick.bind(this);

		this._container = document.createElement("div");
		this._container.classList.add("container");

		this._inputElement = document.createElement("input");
		this._inputElement.setAttribute("id", "inputField");
		this._inputElement.setAttribute("type", "text");
		this._inputElement.value = context.parameters.valueField.raw? context.parameters.valueField.raw : this._emptyValue;
		this._inputElement.addEventListener("change", this._inputElementOnChange);
		this._inputElement.addEventListener("focus", this._inputElementOnFocus);
		this._inputElement.addEventListener("focusout", this._inputElementOnFocusOut);

		if(showButton){
			this._container.classList.add("iconPresent");

			this._iconElement = document.createElement("span");
			this._iconElement.setAttribute("id", "iconElement");
			this._iconElement.classList.add("ms-Icon");
			this._iconElement.addEventListener("click", this._iconElementOnClick);
			this._iconElement.addEventListener("mouseenter", this._iconElementOnMouseenter);
			this._iconElement.addEventListener("mouseleave", this._iconElementOnMouseleave);
		}

		var errorIconLabelElement = document.createElement("label");
		errorIconLabelElement.innerHTML = "";
		errorIconLabelElement.classList.add("icon");

		this._errorLabelElement = document.createElement("label");
		this._errorLabelElement.innerHTML = context.resources.getString("ErrorText_IncorrectNumber_Key");

		this._errorContainer = document.createElement("div");
		this._errorContainer.classList.add("Error");
		this._errorContainer.appendChild(errorIconLabelElement);
		this._errorContainer.appendChild(this._errorLabelElement);
		
		//Handle Value before we add the Elements
		this.checkInput(context.parameters.valueField.raw);

		// appending the HTML elements to the control's HTML container element.
		this._container.appendChild(this._inputElement);
		if(showButton){
			this._container.appendChild(this._iconElement);
		}
		this._container.appendChild(this._errorContainer);
		container.appendChild(this._container);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._context = context;
		this.checkInput(context.parameters.valueField.raw);

		let readOnly = context.mode.isControlDisabled;
		let masked = false;
		if (context.parameters.valueField.security) {
			readOnly = readOnly || !context.parameters.valueField.security.editable;
			masked = !context.parameters.valueField.security.readable;
		}

		/*debugger;
		let requiredLevel = context.parameters.valueField.attribute?.RequiredLevel;
		if(requiredLevel === 1 || requiredLevel === 2){
			this._fieldIsRequired = true;
		}*/

		this._inputElement.readOnly = readOnly;
		if(readOnly){
			this._container.classList.add("readOnly");
		}else{
			this._container.classList.remove("readOnly");
		}

		if(masked){
			this._inputElement.value = this._maskValue;
			this._value = this._inputElement.value;
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		if(this._numberValidReturnValue){
			return {
				valueField: this._value,
				numberValid : this._numberValidReturnValue
			};
		} else{
			return {
				numberValid : this._numberValidReturnValue
			};
		}
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		this._inputElement.removeEventListener("change",this._inputElementOnChange);
		this._inputElement.removeEventListener("focus",this._inputElementOnFocus);
		this._inputElement.removeEventListener("focusout",this._inputElementOnFocusOut);
		
		if(typeof this._iconElement !== 'undefined' && this._iconElement !== null){
			this._iconElement.removeEventListener("click", this._iconElementOnClick);
			this._iconElement.removeEventListener("mouseenter", this._iconElementOnMouseenter);
			this._iconElement.removeEventListener("mouseleave", this._iconElementOnMouseleave);
		}
	}

	public inputOnChange():void{
		this.checkInput(this._inputElement.value);
		this._notifyOutputChanged();
	}

	private checkInput(input: string | null){
		if(input === "" || input === null){
			this._inputElement.value = this._emptyValue;
			this._value = "";

			this.handleErrorMessage(false);
		}
		else if(input !== "" && input !== null && this.isCorrectPhoneNumber(input)){
			this.handleErrorMessage(false);
			var parsedPhoneNumber = (this._defaultCC !== "")? PhoneNumber(input, this._defaultCC) : PhoneNumber(input);

			if(parsedPhoneNumber === undefined || !parsedPhoneNumber.isValid()){
				this._value = input;
				this._numberValidReturnValue = false;
			}else {
				this._value = parsedPhoneNumber.getNumber(this._outputFormat);
				this._inputElement.value = this._value;
				this._numberValidReturnValue = true;
			}
		}
		else{
			this.handleErrorMessage(true);

			this._value = input !== null? input : "";
			this._numberValidReturnValue = false;
		}
	}

	private handleErrorMessage(add: boolean){
		if(add){
			this._inputElement.classList.add("incorrect");
			this._errorContainer.classList.add("inputError");
			if(typeof this._iconElement !== 'undefined' && this._iconElement !== null){
				this._iconElement.classList.add("inputError");
			}
		} else {
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			if(typeof this._iconElement !== 'undefined' && this._iconElement !== null){
				this._iconElement.classList.remove("inputError");
			}
		}
	}

	private isCorrectPhoneNumber(value: string): boolean{
		var isValid = false;
		if(value != null && value != "")
		{
			var parsedPhoneNumber = (this._defaultCC !== "")? PhoneNumber(this._inputElement.value, this._defaultCC) : PhoneNumber(this._inputElement.value);

			if(parsedPhoneNumber !== undefined && parsedPhoneNumber.isValid()){
				isValid = true;
				
				if((this._allowedCC != undefined && this._allowedCC.length > 0 && this._allowedCC.indexOf(parsedPhoneNumber.getRegionCode().toUpperCase()) === -1) || 
				   (this._excludedCC != undefined && this._excludedCC.length > 0 && this._excludedCC.indexOf(parsedPhoneNumber.getRegionCode().toUpperCase()) !== -1)){
					isValid = false;
					this._errorLabelElement.innerHTML = this._context.resources.getString("ErrorText_Unallowed_Country_Key");
				}
				
				if(isValid &&
				  (this._allowedTypes != undefined && this._allowedTypes.length > 0 && this._allowedTypes.indexOf(parsedPhoneNumber.getType().toLowerCase()) === -1) || 
				  (this._excludedTypes != undefined && this._excludedTypes.length > 0 && this._excludedTypes.indexOf(parsedPhoneNumber.getType().toLowerCase()) !== -1)){
					isValid = false;
					this._errorLabelElement.innerHTML = this._context.resources.getString("ErrorText_Unallowed_Type_Key");
				}
			}else{
				isValid = false;
				this._errorLabelElement.innerHTML = this._context.resources.getString("ErrorText_IncorrectNumber_Key");
			}
		}
		return isValid;
	}

	public inputOnFocus():void
	{
		if(this._inputElement.value === this._emptyValue)
		{
			this._inputElement.value = "";
		}
	}

	public inputOnFocusOut():void
	{
		if(this._inputElement.value === "")
		{
			this._inputElement.value = this._emptyValue;
		}
	}

	public inputAddHighlightClass():void
	{
		this._inputElement.classList.add("highlight");
	}

	public inputRemoveHighlightClass():void
	{
		this._inputElement.classList.remove("highlight");
	}

	private handleButtonClick(): void {
		if(this._clickToCall !== "custom" && this._clickToCall !== "none"){
			window.open(this._clickToCall + ":" + this._value.replace(/\s/g, ""), '_blank');
		}

		this.openQuickCreateForm();
	}

	private openQuickCreateForm(): void
	{
		if(this._openQuickCreate && typeof Xrm !== 'undefined'){
			let entityId = (<any>this._context.mode).contextInfo.entityId;
			let entityTypeName = (<any>this._context.mode).contextInfo.entityTypeName;
			let entityRecordName = (<any>this._context.mode).contextInfo.entityRecordName;

			let entityReference = {
				entityType: entityTypeName,
				id: entityId,
				name: entityRecordName
			}

			let entityOptions = {
				entityName: "phonecall",
				useQuickCreateForm: true,
				createFromEntity: entityReference
			};

			let formParameters = {
				to: [ entityReference ]
			};		
			
			(<any>Xrm).Navigation.openForm(entityOptions, formParameters);
		}
	}
}