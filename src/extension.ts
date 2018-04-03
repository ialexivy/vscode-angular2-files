import { ExtensionContext, commands, window, workspace } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import { IPath } from './models/path';
import { showFileNameDialog, displayStatusMessage } from './editor';
import { commandsMap } from './commands';
import { toTileCase } from './formatting';
import AngularCli from './Angular-Cli';
import { ResourceType } from './enums/resource-type';

export async function activate(context: ExtensionContext) {
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  let config = {};

  setImmediate(async () => config = await cm.getConfig());

  // watch and update on config file changes
  cm.watchConfigFiles(async () => config = await cm.getConfig());

  const showDynamicDialog = (args, fileName: string, resource: ResourceType) => {
    showFileNameDialog(args, resource, fileName)
      .then(loc => angularCli.generateResources.call(angularCli, resource, loc, config)
        .then(displayStatusMessage(toTileCase(resource), loc.fileName)))
      .catch(err => window.showErrorMessage(err));
  };

  for (const [key, value] of commandsMap) {
    const command = commands.registerCommand(key, args => showDynamicDialog(args, value.fileName, value.resource));
    context.subscriptions.push(command);
  }
}
