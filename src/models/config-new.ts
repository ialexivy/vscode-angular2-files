export type FileVersion = number;

export interface AngularCliConfiguration {
  $schema?: string;
  version: FileVersion;
  cli?: CliOptions;
  schematics?: SchematicOptions;
  newProjectRoot?: string;
  defaultProject?: string;
  projects?: {};
}
export interface CliOptions {
  defaultCollection?: string;
  packageManager?: ('npm' | 'cnpm' | 'yarn');
  warnings?: {
    versionMismatch?: boolean;
    typescriptMismatch?: boolean;
    [k: string]: any;
  };
}
export interface SchematicOptions {
  '@schematics/angular:component'?: {
    inlineStyle?: boolean;
    inlineTemplate?: boolean;
    viewEncapsulation?: ('Emulated' | 'Native' | 'None');
    changeDetection?: ('Default' | 'OnPush');
    prefix?: string;
    styleext?: string;
    spec?: boolean;
    flat?: boolean;
    skipImport?: boolean;
    selector?: string;
    module?: string;
    export?: boolean;
    [k: string]: any;
  };
  '@schematics/angular:directive'?: {
    prefix?: string;
    spec?: boolean;
    skipImport?: boolean;
    selector?: string;
    flat?: boolean;
    module?: string;
    export?: boolean;
    [k: string]: any;
  };
  '@schematics/angular:module'?: {
    routing?: boolean;
    routingScope?: ('Child' | 'Root');
    spec?: boolean;
    flat?: boolean;
    commonModule?: boolean;
    module?: string;
    [k: string]: any;
  };
  '@schematics/angular:service'?: {
    flat?: boolean;
    spec?: boolean;
    [k: string]: any;
  };
  '@schematics/angular:pipe'?: {
    flat?: boolean;
    spec?: boolean;
    skipImport?: boolean;
    module?: string;
    export?: boolean;
    [k: string]: any;
  };
  '@schematics/angular:class'?: {
    spec?: boolean;
    [k: string]: any;
  };
  [k: string]: {
    [k: string]: any;
  };
}
