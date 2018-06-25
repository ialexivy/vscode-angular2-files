import { ExtensionContext, commands, window, workspace } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import { IPath } from './models/path';
import { showFileNameDialog, showWarning, showOptionsDialog, displayStatusMessage, configureOptionsValues, mapConfigValues } from './editor';
import { commandsMap } from './commands';
import { toTileCase } from './formatting';
import { AngularCli } from './angular-cli';
import { ResourceType } from './enums/resource-type';
import { IConfig } from './models/config';
import { OptionType } from './enums/option-type';

export async function activate(context: ExtensionContext) {
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  let config: IConfig = null;

  setImmediate(async () => config = await cm.getConfig());

  // watch and update on config file changes
  cm.watchConfigFiles(async () => config = await cm.getConfig());

  const showDynamicDialog = async (args, fileName: string, resource: ResourceType) => {
    const loc = await showFileNameDialog(args, resource, fileName);

    let resourceConfig = config;

    if (loc.params.includes(OptionType.ShowOptions)) {
      const selectedOptions = await showOptionsDialog(config, loc, resource);
      if (selectedOptions) {
        const optionsValuesMap = await configureOptionsValues(config, loc, resource, selectedOptions);
        loc.params = [...new Set([...loc.params, ...optionsValuesMap.keys()])];
        resourceConfig = mapConfigValues(config, resource, optionsValuesMap);
      }
    } else {
      if (loc.paramsMap.size > 0) {
        resourceConfig = mapConfigValues(config, resource, loc.paramsMap);
      }
    }

    await angularCli.generateResources(resource, loc, resourceConfig);
    displayStatusMessage(toTileCase(resource), loc.fileName);
  };

  for (const [key, value] of commandsMap) {
    const command = commands.registerCommand(key, args => showDynamicDialog(args, value.fileName, value.resource));
    context.subscriptions.push(command);
  }
}
