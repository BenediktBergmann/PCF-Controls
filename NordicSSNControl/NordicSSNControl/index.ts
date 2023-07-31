import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class NordicSSNControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	// Reference to ComponentFramework Context object
	private _context: ComponentFramework.Context<IInputs>;

	private _inputElementOnChange: EventListenerOrEventListenerObject;
	private _inputElementOnFocus: EventListenerOrEventListenerObject;
	private _inputElementOnFocusOut: EventListenerOrEventListenerObject;

	private _value: string;
	private _allowSwedishSSN: boolean;
	private _allowSwedishCN: boolean;
	private _allowFinnishPIC: boolean;
	private _emptyValue : string = "---";
	private _maskValue : string = "******";
	private _inputValidReturnValue : boolean = false;

	// HTML container
	private _container: HTMLDivElement;
	private _inputElement: HTMLInputElement;
	private _countryIndicatorElement: HTMLDivElement;
	// label element created as part of this control
	private _errorContainer: HTMLDivElement;

	//RegEx for Swedish Social Security Number and Coordination Number
	private _yearShort_RegEx: string = '[0-9]{2}';
    private _yearLong_RegEx: string = '((19|20|21)' + this._yearShort_RegEx + ')';
    private _month_RegEx: string = '(0[1-9]|1[0-2])';
    private _day_RegEx: string = '(0[1-9]|((1|2)[0-9])|3[0-1])';
    private _dayCoordinationNumber_Sweden_RegEx: string = '(6[1-9]|((7|8)[0-9])|9[0-1])';
    private _suffix_Sweden_RegEx: string = '[0-9]{4}';

    // SSYYMMDD-NNNN
    private _socialSecurityNumber_Sweden_ReqEx: string = '(' + this._yearLong_RegEx + this._month_RegEx + this._day_RegEx + '-' + this._suffix_Sweden_RegEx + ')';
    private _coordinationNumber_Sweden_ReqEx: string = '(' + this._yearLong_RegEx + this._month_RegEx + this._dayCoordinationNumber_Sweden_RegEx + '-' + this._suffix_Sweden_RegEx + ')';
	
	//RegEx for Finnish Social Security Number
	private _centuryIdentifier_Finland_RegEx: string = '(\\+|-|A)';
    private _suffix_Finland_RegEx: string = '([0-9]{3}([0-9]|[A-F]|H|[J-N]|P|[R-Y]))';
	private _verificationCode_Finnish : string = "0123456789ABCDEFHJKLMNPRSTUVWXY";

	private _personalIdentityCode_Finland_RegEx: string = '(' + this._day_RegEx + this._month_RegEx + this._yearShort_RegEx + this._centuryIdentifier_Finland_RegEx + this._suffix_Finland_RegEx + ')';

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

		if(context.parameters.allowSwedishSSN!.raw === "Yes"){
			this._allowSwedishSSN = true;
		}
		else{
			this._allowSwedishSSN = false;
		}

		if(context.parameters.allowSwedishCN!.raw === "Yes"){
			this._allowSwedishCN = true;
		}
		else{
			this._allowSwedishCN = false;
		}

		if(context.parameters.allowFinnishPIC!.raw === "Yes"){
			this._allowFinnishPIC = true;
		}
		else{
			this._allowFinnishPIC = false;
		}

		this._container = document.createElement("div");
		this._container.classList.add("container");
		this._container.classList.add("iconPresent");

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

		this._countryIndicatorElement = document.createElement("div");
		this._countryIndicatorElement.classList.add("fflag");
		this._countryIndicatorElement.classList.add("ff-sm");
		this._countryIndicatorElement.classList.add("hide");

		let iconElement = document.createElement("span");
		iconElement.setAttribute("id", "iconElement");
		iconElement.appendChild(this._countryIndicatorElement);

		var errorIconLabelElement = document.createElement("label");
		errorIconLabelElement.appendChild(document.createTextNode(""));
		//errorIconLabelElement.innerHTML = "";
		errorIconLabelElement.classList.add("icon");

		var errorLabelElement = document.createElement("label");
		errorIconLabelElement.appendChild(document.createTextNode(context.resources.getString("ErrorText_Key")));
		//errorLabelElement.innerHTML = context.resources.getString("ErrorText_Key");

		this._errorContainer = document.createElement("div");
		this._errorContainer.classList.add("Error");
		this._errorContainer.appendChild(errorIconLabelElement);
		this._errorContainer.appendChild(errorLabelElement);

		//Handle Value before we add the Elements
		this.handleValue(context.parameters.valueField.raw);
		
		// appending the HTML elements to the control's HTML container element.
		this._container.appendChild(this._inputElement);
		this._container.appendChild(iconElement);
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
		if(readOnly){
			this._container.classList.add("readOnly");
		}else{
			this._container.classList.remove("readOnly");
		}

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
		if(this._inputValidReturnValue){
			return {
				valueField: this._value,
				inputValid : this._inputValidReturnValue
			};
		} else{
			return {
				inputValid : this._inputValidReturnValue
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
	}

	public inputOnChange():void{
		if(this._inputElement.value === "" || this._inputElement.value === null){
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			this._inputValidReturnValue = true;

			this._countryIndicatorElement.classList.add("hide");
		} else if(this._allowSwedishSSN && this.isCorrectSwedishSSN(this._inputElement.value)){
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			this._inputValidReturnValue = true;

			this._countryIndicatorElement.classList.add("fflag-SE");
			this._countryIndicatorElement.classList.remove("fflag-FI");
			this._countryIndicatorElement.classList.remove("hide");
		} else if(this._allowSwedishCN && this.isCorrectSwedishCN(this._inputElement.value)){
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			this._inputValidReturnValue = true;

			this._countryIndicatorElement.classList.add("fflag-SE");
			this._countryIndicatorElement.classList.remove("fflag-FI");
			this._countryIndicatorElement.classList.remove("hide");
		} else if(this._allowFinnishPIC && this.isCorrectFinnishPIC(this._inputElement.value)){
			this._inputElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			this._inputValidReturnValue = true;

			this._countryIndicatorElement.classList.add("fflag-FI");
			this._countryIndicatorElement.classList.remove("fflag-SE");
			this._countryIndicatorElement.classList.remove("hide");
		}
		else{
			this._inputElement.classList.add("incorrect");
			this._errorContainer.classList.add("inputError");
			this._inputValidReturnValue = false;

			this._countryIndicatorElement.classList.add("hide");
		}
		
		this.handleValue(this._inputElement.value);
		
		this._notifyOutputChanged();
	}

	private isCorrectSwedishSSN(value: string): boolean{
		if(value.length !== 13){
			return false;
		}

		if(!(new RegExp(this._socialSecurityNumber_Sweden_ReqEx).test(value))){
			return false;
		}
		
		//Todo: Check if correct date
		
		if(!this.isCorrectSwedishCheckSum(value)){
			return false;
		}

		return true;
	}

	private isCorrectSwedishCN(value: string): boolean{
		if(value.length !== 13){
			return false;
		}

		if(!(new RegExp(this._coordinationNumber_Sweden_ReqEx).test(value))){
			return false;
		}
		
		//Todo: Check if correct date

		if(!this.isCorrectSwedishCheckSum(value)){
			return false;
		}

		return true;
	}

	private isCorrectSwedishCheckSum(value: string): boolean{
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

	private isCorrectFinnishPIC(value: string): boolean{
		if(value.length !== 11){
			return false;
		}

		if(!(new RegExp(this._personalIdentityCode_Finland_RegEx).test(value))){
			return false;
		}

		//Todo: Check if correct date
		
		if(!this.isCorrectFinnishCheckSum(value)){
			return false;
		}

		return true;
	}

	private isCorrectFinnishCheckSum(value: string): boolean{
		let valueWithoutCenturyIdentifierAndCheckSum : string = value.substring(0, value.length -1).replace('-', '').replace('+', '').replace('A', '');
		let valueAsNumber = parseInt(valueWithoutCenturyIdentifierAndCheckSum);
		let expectedChecksum = this._verificationCode_Finnish[(valueAsNumber % 31)];
		let checkSum = value.substring(value.length - 1);

		if(checkSum !== expectedChecksum){
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