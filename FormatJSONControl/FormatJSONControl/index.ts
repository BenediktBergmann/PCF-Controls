import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class FormatJSONControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;

	private _value: string;
	private _emptyValue = "---";
	private _maskValue = "******";

	private _syntaxHighlighting = false;
	private _required = false;
	private _maxLength: number;
	private _rows: number;

	private _textAreaElementOnChange: EventListenerOrEventListenerObject;
	private _textAreaElementOnFocus: EventListenerOrEventListenerObject;
	private _textAreaElementOnFocusOut: EventListenerOrEventListenerObject;

	// HTML container
	private _container: HTMLDivElement;
	private _textAreaElement: HTMLTextAreaElement;
	private _highlightedElement: HTMLDivElement;
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

		this._rows = context.parameters.rowsTextArea.raw ?? 5;
		this._maxLength = (this._context.parameters.valueField.attributes?.MaxLength != undefined)? this._context.parameters.valueField.attributes?.MaxLength : 2000;
		//reference for requiredLevel: https://docs.microsoft.com/en-us/powerapps/developer/component-framework/reference/metadata
		this._required = (this._context.parameters.valueField.attributes?.RequiredLevel == 1)? true : false;

		this._context.parameters.valueField

		if(context.parameters.showSyntaxHighlighting.raw.toLocaleLowerCase() == "yes"){
			this._syntaxHighlighting = true;
		}

		this._textAreaElementOnChange = this.textAreaOnChange.bind(this);
		this._textAreaElementOnFocus = this.textAreaOnFocus.bind(this);
		this._textAreaElementOnFocusOut = this.textAreaOnFocusOut.bind(this);

		this._container = document.createElement("div");
		this._container.classList.add("container");

		//Creating both to track changes.
		this._textAreaElement = document.createElement("textarea");
		this._textAreaElement.setAttribute("aria-multiline", "true");
		this._textAreaElement.setAttribute("autocomplete", "off");
		this._textAreaElement.setAttribute("maxlength", this._maxLength.toString());
		this._textAreaElement.setAttribute("style", "height: "+ this._rows * 21 + "px;");
		if(this._syntaxHighlighting){
			this._textAreaElement.setAttribute("readonly", "true");
		}
		this._textAreaElement.addEventListener("change", this._textAreaElementOnChange);
		this._textAreaElement.addEventListener("focus", this._textAreaElementOnFocus);
		this._textAreaElement.addEventListener("focusout", this._textAreaElementOnFocusOut);
		
		this._highlightedElement = document.createElement("div");
		this._highlightedElement.setAttribute("style", "min-height: "+ this._rows * 21 + "px;");
		this._highlightedElement.classList.add("highlighted");
		

		var errorIconLabelElement = document.createElement("label");
		errorIconLabelElement.innerHTML = "";
		errorIconLabelElement.classList.add("icon");

		this._errorLabelElement = document.createElement("label");
		this._errorLabelElement.innerHTML = context.resources.getString("ErrorText_Key");

		this._errorContainer = document.createElement("div");
		this._errorContainer.classList.add("Error");
		this._errorContainer.appendChild(errorIconLabelElement);
		this._errorContainer.appendChild(this._errorLabelElement);
		
		//Handle Value before we add the Elements
		this.handleValue(context.parameters.valueField.raw);

		// appending the HTML elements to the control's HTML container element.
		if(!this._syntaxHighlighting){
			this._container.appendChild(this._textAreaElement);
		}
		else{
			this._container.appendChild(this._highlightedElement);
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
		this.handleValue(context.parameters.valueField.raw);

		let readOnly = this._context.mode.isControlDisabled;
		let masked = false;
		if (this._context.parameters.valueField.security) {
			readOnly = readOnly || !this._context.parameters.valueField.security.editable;
			masked = !this._context.parameters.valueField.security.readable;
		}

		this._textAreaElement.readOnly = readOnly;
		if(readOnly){
			this._container.classList.add("readOnly");
		}else{
			this._container.classList.remove("readOnly");
		}

		if(masked){
			this._textAreaElement.value = this._maskValue;
			this._highlightedElement.innerHTML = this._maskValue;
			//this._value = this._textAreaElement.value;
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
		this._textAreaElement.removeEventListener("change",this._textAreaElementOnChange);
		this._textAreaElement.removeEventListener("focus",this._textAreaElementOnFocus);
		this._textAreaElement.removeEventListener("focusout",this._textAreaElementOnFocusOut);
	}

	public textAreaOnChange():void{
		if((this._required && (this._textAreaElement.value === "" || this._textAreaElement.value === null)) || (this._textAreaElement.value != "" && this._textAreaElement.value != null && !this.isJSON(this._textAreaElement.value))){
			this._textAreaElement.classList.add("incorrect");
			this._highlightedElement.classList.add("incorrect");
			this._errorContainer.classList.add("inputError");
		}
		else {
			this._textAreaElement.classList.remove("incorrect");
			this._highlightedElement.classList.remove("incorrect");
			this._errorContainer.classList.remove("inputError");
			this.handleValue(this._textAreaElement.value);
			this._notifyOutputChanged();
		}
	}

	public handleValue(input: string|null): void
	{
		if(input != null && input != ""){
			if(this.isJSON(input)){
				var json = JSON.parse(input);
				this._value = JSON.stringify(json, null, 0);

				var output = JSON.stringify(json, null, 4);
				
				this._highlightedElement.innerHTML = this.syntaxHighlight(output);
				this._textAreaElement.value = output;
			}
		} else {
			this._textAreaElement.value = this._emptyValue;
			this._value = "";
		}
	}

	public textAreaOnFocus():void
	{
		if(this._textAreaElement.value === this._emptyValue)
		{
			this._textAreaElement.value = "";
		}
		
		this._textAreaElement.setAttribute("data-focusvisible-polyfill", "true");
	}

	public textAreaOnFocusOut():void
	{
		if(this._textAreaElement.value === "")
		{
			this._textAreaElement.value = this._emptyValue;
		}
		
		this._textAreaElement.removeAttribute("data-focusvisible-polyfill");
	}
	
	private syntaxHighlight(json: string) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\n/g, "<br />");
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}

	private isJSON(input: string) { 
		try { 
			return (JSON.parse(input) && !!input); 
		} catch (e) { 
			return false; 
		}
	} 
}