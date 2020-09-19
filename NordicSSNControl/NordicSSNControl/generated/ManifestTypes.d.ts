/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    valueField: ComponentFramework.PropertyTypes.StringProperty;
    inputValid: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    allowSwedishSSN: ComponentFramework.PropertyTypes.EnumProperty<"Yes" | "No">;
    allowSwedishCN: ComponentFramework.PropertyTypes.EnumProperty<"Yes" | "No">;
    allowFinnishPIC: ComponentFramework.PropertyTypes.EnumProperty<"Yes" | "No">;
}
export interface IOutputs {
    valueField?: string;
    inputValid?: boolean;
}
