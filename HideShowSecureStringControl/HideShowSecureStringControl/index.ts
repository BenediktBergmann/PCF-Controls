import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class HideShowSecureStringControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;

	private _inputElementOnChange: EventListenerOrEventListenerObject;
	private _inputElementOnFocus: EventListenerOrEventListenerObject;
	private _inputElementOnFocusOut: EventListenerOrEventListenerObject;
	private _iconElementOnMouseenter: EventListenerOrEventListenerObject;
	private _iconElementOnMouseleave: EventListenerOrEventListenerObject;
	private _iconElementOnClick: EventListenerOrEventListenerObject;
	
	private _value: string;
	private _inputShown: boolean;
	private _emptyValue = "---";
	private _maskValue = "******";

	// HTML container
	private _container: HTMLDivElement;
	private _inputElement: HTMLInputElement;
	private _iconElement: HTMLSpanElement;

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
		this._notifyOutputChanged = notifyOutputChanged;

		if(context.parameters.defaultVisibility!.raw.toLowerCase() === "show"){
			this._inputShown = true;
		}
		else{
			this._inputShown = false;
		}

		this._inputElementOnChange = this.inputOnChange.bind(this);
		this._inputElementOnFocus = this.inputOnFocus.bind(this);
		this._inputElementOnFocusOut = this.inputOnFocusOut.bind(this);
		this._iconElementOnMouseenter = this.inputAddHighlightClass.bind(this);
		this._iconElementOnMouseleave = this.inputRemoveHighlightClass.bind(this);
		this._iconElementOnClick = this.toggleFieldVisibility.bind(this);

		// Create HTML
		this._container = document.createElement("div");
		this._container.classList.add("container");
		this._container.classList.add("iconPresent");

		this._inputElement = document.createElement("input");
		this._inputElement.setAttribute("type", (this._inputShown)? "text" : "password");
		this._inputElement.setAttribute("id", "inputField");
		this._inputElement.addEventListener("change", this._inputElementOnChange);
		this._inputElement.addEventListener("focus", this._inputElementOnFocus);
		this._inputElement.addEventListener("focusout", this._inputElementOnFocusOut);

		this._iconElement = document.createElement("span");
		this._iconElement.setAttribute("id", "iconElement");
		this._iconElement.classList.add("ms-Icon");
		this._iconElement.classList.add("noOutline");
		this._iconElement.addEventListener("click", this._iconElementOnClick);
		this._iconElement.addEventListener("mouseenter", this._iconElementOnMouseenter);
		this._iconElement.addEventListener("mouseleave", this._iconElementOnMouseleave);

		//Handle Value before we add the Elements
		this.handleValue(context.parameters.valueField.raw);

		// Toggling so that the toggling functions changes back to correct value
		this._inputShown = !this._inputShown;
		this.toggleFieldVisibility();

		// appending the HTML elements to the control's HTML container element.
		this._container.appendChild(this._inputElement);
		this._container.appendChild(this._iconElement);
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
		this._iconElement.removeEventListener("click",this._iconElementOnClick);
		this._iconElement.removeEventListener("mouseenter",this._iconElementOnMouseenter);
		this._iconElement.removeEventListener("mouseleave",this._iconElementOnMouseleave);
	}

	private toggleFieldVisibility(): void
	{
		this._inputShown = !this._inputShown;
		this.handleValue(this._value);
		this._inputElement.setAttribute("type", (this._inputShown)? "text" : "password");
		
		if(!this._inputShown){
			this._iconElement.classList.add("hide");
			this._iconElement.classList.remove("view");
		} else {
			this._iconElement.classList.add("view");
			this._iconElement.classList.remove("hide");
		}
		//this._iconElement.innerHTML = (this._inputShown)? "<i class=\"ms-Icon ms-Icon--Hide3\" aria-hidden=\"true\" aria-label=\"Hide\"></i>" : "<i class=\"ms-Icon ms-Icon--View\" aria-hidden=\"true\" aria-label=\"Show\"></i>";
	}

	public inputOnChange():void
	{
		this.handleValue(this._inputElement.value);
		this._notifyOutputChanged();
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
		if(this._inputElement.value === "" && this._inputShown)
		{
			this._inputElement.value = this._emptyValue;
		}
	}

	public handleValue(input: string|null): void
	{
		if(input === null || input === "")
		{
			this._inputElement.value = (this._inputShown) ? this._emptyValue : "";
			this._value = "";
		}
		else
		{
			this._value = input;
			this._inputElement.value = input;
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
}