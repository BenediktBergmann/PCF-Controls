import {IInputs, IOutputs} from "./generated/ManifestTypes";
var PhoneNumber = require( 'awesome-phonenumber' );

export class CheckPhoneNumberControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;

	private _inputElementOnChange: EventListenerOrEventListenerObject;

	private _value: string;
	private _defaultCC: string;
	private _allowedCC: string[];
	private _excludedCC: string[];
	private _allowedTypes: string[];
	private _excludedTypes: string[];

	private _outputFormat: string;

	// HTML container
	private _container: HTMLDivElement;
	private _inputElement: HTMLInputElement;
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

		this._container = document.createElement("div");

		this._value = context.parameters.valueField.raw == null ? "---" : context.parameters.valueField.raw;

		this._notifyOutputChanged = notifyOutputChanged;
		this._context = context;

		this._inputElementOnChange = this.inputOnChange.bind(this);

		this._inputElement = document.createElement("input");
		this._inputElement.addEventListener("change", this._inputElementOnChange);
		this._inputElement.setAttribute("value", this._value);
		this._inputElement.setAttribute("type", "text");

		var errorIconLabelElement = document.createElement("label");
		errorIconLabelElement.innerHTML = "";
		errorIconLabelElement.classList.add("icon");

		this._errorLabelElement = document.createElement("label");
		this._errorLabelElement.innerHTML = context.resources.getString("ErrorText_IncorrectNumber_Key");

		this._errorContainer = document.createElement("div");
		this._errorContainer.classList.add("Error");
		this._errorContainer.appendChild(errorIconLabelElement);
		this._errorContainer.appendChild(this._errorLabelElement);
		
		// appending the HTML elements to the control's HTML container element.
		this._container.appendChild(this._inputElement);
		this._container.appendChild(this._errorContainer);
		container.appendChild(this._container);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// storing the latest context from the control.
		this._value = context.parameters.valueField.raw == null ? "" : context.parameters.valueField.raw;
		//this._context = context;
		this._inputElement.setAttribute("value", this._value);

		let readOnly = this._context.mode.isControlDisabled;
		let masked = false;
		if (this._context.parameters.valueField.security) {
			readOnly = readOnly || !this._context.parameters.valueField.security.editable;
			masked = !this._context.parameters.valueField.security.readable;
		}

		this._inputElement.readOnly = readOnly;
		if(masked){
			this._inputElement.value = "******";
			this._value = this._inputElement.value;
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			valueField: this._value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		this._inputElement.removeEventListener("change",this._inputElementOnChange);
	}

	public inputOnChange():void{
		if(this._inputElement.value != "" && !this.isCorrectPhoneNumber(this._inputElement.value)){
			this._inputElement.classList.add("incorrect");
			this._errorContainer.classList.add("inputError");
			this._value = "";
		}
		else{
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			var parsedPhoneNumber = (this._defaultCC !== "")? PhoneNumber(this._inputElement.value, this._defaultCC) : PhoneNumber(this._inputElement.value);

			if(parsedPhoneNumber === undefined){
				this._value = this._inputElement.value;
			}else {
				this._value = parsedPhoneNumber.getNumber(this._outputFormat);
				this._inputElement.value = parsedPhoneNumber.getNumber(this._outputFormat);
			}
			this._notifyOutputChanged();
		}
	}

	private isCorrectPhoneNumber(value: string): boolean{
		var isValid = false;
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

		return isValid;
	}
}