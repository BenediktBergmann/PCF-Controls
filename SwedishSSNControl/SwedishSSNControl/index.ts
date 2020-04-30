import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class SwedishSSNControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	// Reference to ComponentFramework Context object
	private _context: ComponentFramework.Context<IInputs>;

	private _inputElementOnChange: EventListenerOrEventListenerObject;
	private _inputElementOnFocus: EventListenerOrEventListenerObject;
	private _inputElementOnFocusOut: EventListenerOrEventListenerObject;

	private _value: string;
	private _allowSSN: boolean;
	private _allowCN: boolean;
	private _emptyValue = "---";
	private _maskValue = "******";

	// HTML container
	private _container: HTMLDivElement;
	private _inputElement: HTMLInputElement;
	// label element created as part of this control
	private _errorContainer: HTMLDivElement;

	private _regExYearShort = '[0-9]{2}';
    private _regExYearLong = '((19|20|21)' + this._regExYearShort + ')';
    private _regExMonth = '(0[1-9]|1[0-2])';
    private _regExDayPersonnummer = '(0[1-9]|((1|2)[0-9])|3[0-1])';
    private _regExDaySamordningsnummer = '(6[1-9]|((7|8)[0-9])|9[0-1])';
    private _regExDayPersonnummerWithSamordningsnummer = '(' + this._regExDayPersonnummer + '|' + this._regExDaySamordningsnummer + ')';
    private _regExSuffix = '[0-9]{4}';

    // SSYYMMDD-NNNN
    private _personnummerReqEx = '(' + this._regExYearLong + this._regExMonth + this._regExDayPersonnummer + '-' + this._regExSuffix + ')';
    private _samordningsnummerReqEx = '(' + this._regExYearLong + this._regExMonth + this._regExDaySamordningsnummer + '-' + this._regExSuffix + ')';
	private _personnummerSamordningsnummerReqEx = '(' + this._regExYearLong + this._regExMonth + this._regExDayPersonnummerWithSamordningsnummer + '-' + this._regExSuffix + ')';
	
	private _regExToCheck : RegExp;

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

		if(context.parameters.allowSSN!.raw == "Yes"){
			this._allowSSN = true;
		}
		else{
			this._allowSSN = false;
		}

		if(context.parameters.allowCN!.raw == "Yes"){
			this._allowCN = true;
		}
		else{
			this._allowCN = false;
		}

		if(this._allowSSN && this._allowCN){
			this._regExToCheck = new RegExp(this._personnummerSamordningsnummerReqEx);
		}else if(this._allowSSN && !this._allowCN){
			this._regExToCheck = new RegExp(this._personnummerReqEx);
		}else if(!this._allowSSN && this._allowCN){
			this._regExToCheck = new RegExp(this._samordningsnummerReqEx);
		}

		this._container = document.createElement("div");
		this._container.classList.add("container");
		this._container.classList.add("swedishSSNControl");

		this._notifyOutputChanged = notifyOutputChanged;

		this._inputElementOnChange = this.inputOnChange.bind(this);
		this._inputElementOnFocus = this.inputOnFocus.bind(this);
		this._inputElementOnFocusOut = this.inputOnFocusOut.bind(this);

		this._inputElement = document.createElement("input");
		this._inputElement.setAttribute("type", "text");
		this._inputElement.setAttribute("id", "inputField");
		this._inputElement.addEventListener("change", this._inputElementOnChange);
		this._inputElement.addEventListener("focus", this._inputElementOnFocus);
		this._inputElement.addEventListener("focusout", this._inputElementOnFocusOut);

		var errorIconLabelElement = document.createElement("label");
		errorIconLabelElement.innerHTML = "";
		errorIconLabelElement.classList.add("icon");

		var errorLabelElement = document.createElement("label");
		errorLabelElement.innerHTML = context.resources.getString("ErrorText_Key");

		this._errorContainer = document.createElement("div");
		this._errorContainer.classList.add("Error");
		this._errorContainer.appendChild(errorIconLabelElement);
		this._errorContainer.appendChild(errorLabelElement);

		//Handle Value before we add the Elements
		this.handleValue(context.parameters.valueField.raw);
		
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
		this.handleValue(context.parameters.valueField.raw);

		let readOnly = this._context.mode.isControlDisabled;
		let masked = false;
		if (this._context.parameters.valueField.security) {
			readOnly = readOnly || !this._context.parameters.valueField.security.editable;
			masked = !this._context.parameters.valueField.security.readable;
		}

		this._inputElement.readOnly = readOnly;
		if(masked){
			this._inputElement.value = this._maskValue
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
		this._inputElement.removeEventListener("focus",this._inputElementOnFocus);
		this._inputElement.removeEventListener("focusout",this._inputElementOnFocusOut);
	}

	public inputOnChange():void{
		if(this._inputElement.value === "" || this._inputElement.value === null || this.isCorrectSSN(this._inputElement.value)){
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			this.handleValue(this._inputElement.value);
			this._notifyOutputChanged();
		}
		else{
			this._inputElement.classList.add("incorrect");
			this._errorContainer.classList.add("inputError");
			this._value = "";
		}
	}

	private isCorrectSSN(value: string): boolean{
		if(value.length != 13){
			return false;
		}
		if(this._regExToCheck === null){
			return false;
		}
		if(!this._regExToCheck.test(value)){
			return false;
		}
		if(!this.correctCheckSum(value)){
			return false;
		}
		return true;
	}

	private correctCheckSum(value: string): boolean{
		var tmp = value
                .replace(/\D/g, "") // strip out all but digits
                .split("") // convert string to array
                .reverse() // reverse order for Luhn
				.slice(0, 10); // keep only 10 digits (i.e. 1977 becomes 77)
		if (tmp.length !== 10) {
			return false;
		}

		var checkSum = tmp
				// convert to number
				.map(function(n) {
					return Number(n);
				})
				// perform arithmetic and return sum
				.reduce(function(previous, current, index) {
					// multiply every other number with two
					if (index % 2) current *= 2;
					// if larger than 10 get sum of individual digits (also n-9)
					if (current > 9) current -= 9;
					// sum it up
					return previous + current;
				});

		//checkSum must be devidable by 10. Then the last digit should be correct.
		if (0 !== checkSum % 10) {
			return false;
		}

		return true;
	}

	public handleValue(input: string|null): void
	{
		if(input === null || input === "")
		{
			this._inputElement.value = this._emptyValue;
			this._value = "";
		}
		else
		{
			this._value = input;
			this._inputElement.value = input;
		}
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
}