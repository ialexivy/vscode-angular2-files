import { OptionType } from './enums/option-type';
import { OptionItem } from './models/option-item';

export const optionsCommands = new Map<OptionType, OptionItem>([
    [OptionType.InlineStyle, { commands: ['--inline-style', '-s'], type: 'True | False', configPath: 'defaults.{resource}.inlineStyle', description: 'Specifies if the style will be in the ts file.' }],
    [OptionType.InlineTemplate, { commands: ['--inline-template', '-t'], type: 'True | False', configPath: 'defaults.{resource}.inlineTemplate', description: 'Specifies if the template will be in the ts file.' }],
    [OptionType.ViewEncapsulation, { commands: ['--view-encapsulation'], type: 'Emulated | Native | None', configPath: 'defaults.{resource}.viewEncapsulation', description: 'Specifies the view encapsulation strategy.' }],
    [OptionType.ChangeDetection, { commands: ['--change-detection', '-c'], type: 'Default | OnPush', configPath: 'defaults.{resource}.changeDetection', description: 'Specifies the change detection strategy.' }],
    [OptionType.Prefix, { commands: ['--prefix', '-p'], configPath: 'defaults.{resource}.prefix', description: 'The prefix to apply to generated selectors.' }],
    [OptionType.Styleext, { commands: ['--styleext'], configPath: 'defaults.{resource}.styleext', description: 'The file extension to be used for style files.' }],
    [OptionType.Spec, { commands: ['--spec'], type: 'True | False', configPath: 'defaults.{resource}.spec', description: 'Specifies if a spec file is generated.' }],
    [OptionType.Flat, { commands: ['--flat'], type: 'True | False', configPath: 'defaults.{resource}.flat', description: 'Flag to indicate if a dir is created.' }],
    [OptionType.SkipImport, { commands: ['--skip-import'], configPath: 'defaults.{resource}.skipImport', type: 'True | False', description: 'Flag to skip the module import' }],
    [OptionType.Selector, { commands: ['--selector'], configPath: 'defaults.{resource}.selector', description: 'The selector to use for the component.' }],
    [OptionType.Module, { commands: ['--module', '-m'], configPath: 'defaults.{resource}.module', description: 'Allows specification of the declaring module.' }],
    [OptionType.Export, { commands: ['--export'], configPath: 'defaults.{resource}.export', type: 'True | False', description: 'Specifies if declaring module exports the component.' }],
    [OptionType.Routing, { commands: ['--routing'], configPath: 'defaults.{resource}.routing', type: 'True | False', description: 'Generates a routing module.' }],
    [OptionType.RoutingScope, { commands: ['--routing-scope'], configPath: 'defaults.{resource}.routingScope', type: 'Child | Root', description: 'The scope for the generated routing.' }],
    [OptionType.CommonModule, { commands: ['--common-module'], configPath: 'defaults.{resource}.commonModule', type: 'True | False', description: 'Flag to control whether the CommonModule is imported.' }],
    [OptionType.ShowOptions, { commands: ['-o'], description: 'Allow to override options' }],
]);
