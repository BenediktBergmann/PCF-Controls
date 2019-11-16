import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

export class CheckPhoneNumberControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;

	private _inputElementOnChange: EventListenerOrEventListenerObject;

	private _value: string;
	private _allowedCC: string[];

	// HTML container
	private _container: HTMLDivElement;
	private _inputElement: HTMLInputElement;
	// label element created as part of this control
	private _errorContainer: HTMLDivElement;

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
		this._allowedCC = [];

		if(context.parameters.allowedCC.raw != null && context.parameters.allowedCC.raw != ""){
			this._allowedCC = context.parameters.allowedCC.raw.split(',');
			this._allowedCC = this._allowedCC.map(el => el.trim().toUpperCase());
		}

		this._container = document.createElement("div");

		this._value = context.parameters.valueField.raw == null ? "" : context.parameters.valueField.raw;

		this._notifyOutputChanged = notifyOutputChanged;

		this._inputElementOnChange = this.inputOnChange.bind(this);

		this._inputElement = document.createElement("input");
		this._inputElement.addEventListener("change", this._inputElementOnChange);
		this._inputElement.setAttribute("type", "text");
		this._inputElement.setAttribute("value", this._value);


		var errorIconLabelElement = document.createElement("label");
		errorIconLabelElement.innerHTML = "";
		errorIconLabelElement.classList.add("icon");

		var errorLabelElement = document.createElement("label");
		errorLabelElement.innerHTML = context.resources.getString("ErrorText_Key");;

		this._errorContainer = document.createElement("div");
		this._errorContainer.classList.add("Error");
		this._errorContainer.appendChild(errorIconLabelElement);
		this._errorContainer.appendChild(errorLabelElement);
		
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
		if(!this.isCorrectPhoneNumber(this._inputElement.value)){
			this._inputElement.classList.add("incorrect");
			this._errorContainer.classList.add("inputError");
			this._value = "";
		}else{
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			var parsedPhoneNumber = parsePhoneNumberFromString(this._inputElement.value);
			if(parsedPhoneNumber === undefined){
				this._value = this._inputElement.value;
			}else {
				this._value = parsedPhoneNumber.formatInternational();
				this._inputElement.value = parsedPhoneNumber.formatInternational();
			}
			this._notifyOutputChanged();
		}
	}

	private isCorrectPhoneNumber(value: string): boolean{
		var isValid = false;
		var parsedPhoneNumber = parsePhoneNumberFromString(value);

		if(parsedPhoneNumber !== undefined && parsedPhoneNumber.isValid){
			if(this._allowedCC != undefined && this._allowedCC.length > 0){
				if(parsedPhoneNumber.country !== undefined && this._allowedCC.indexOf(parsedPhoneNumber.country) !== -1){
					isValid = true;
				}
			}else{
				isValid = true;
			}
		}

		return isValid;
	}
}