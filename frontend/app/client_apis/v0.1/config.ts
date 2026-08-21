export type ConfigValue =
    | string
    | number
    | boolean
    | null;

export type SimulationConfig =
    Record<string, ConfigValue>;

export type ConfigFieldType =
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "select";

export interface ConfigOption {
    value: ConfigValue;
    label: string;
}

export interface ConfigField {
    key: string;
    type: ConfigFieldType;

    label?: string;
    description?: string;

    defaultValue: ConfigValue;

    min?: number;
    max?: number;
    step?: number;

    options?: ConfigOption[];

    /**
     * Можно ли изменить параметр без переинициализации автомата.
     */
    hotReload: boolean;
}

export interface ConfigSchema {
    fields: ConfigField[];
}