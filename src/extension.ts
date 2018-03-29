import { ExtensionContext, commands, window, workspace } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import { IPath } from './models/path';
import { showFileNameDialog, displayStatusMessage } from './editor';
import { toTileCase } from './formatting';
import AngularCli from './Angular-Cli';

export async function activate(context: ExtensionContext) {
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  let config = {};

  setImmediate(async () => config = await cm.getConfig());

  // watch and update on config file changes
  cm.watchConfigFiles(async () => config = await cm.getConfig());

  const commandsMap = {
    'extension.addAngular2Component': { fileName: 'my-component.component.ts', resource: 'component' },
    'extension.addAngular2Directive': { fileName: 'my-directive.directive.ts', resource: 'directive' },
    'extension.addAngular2Pipe': { fileName: 'my-pipe.pipe.ts', resource: 'pipe' },
    'extension.addAngular2Service': { fileName: 'my-service.service.ts', resource: 'service' },
    'extension.addAngular2Class': { fileName: 'my-class.class.ts', resource: 'class' },
    'extension.addAngular2Interface': { fileName: 'my-interface.interface.ts', resource: 'interface' },
    'extension.addAngular2Route': { fileName: 'my-route.routing.ts', resource: 'route' },
    'extension.addAngular2Enum': { fileName: 'my-enum.enum.ts', resource: 'enum' },
    'extension.addAngular2Module': { fileName: 'my-module.module.ts', resource: 'module' },
  };

  const showDynamicDialog = (args, fileName, resource) => {
    showFileNameDialog(args, resource, fileName)
      .then(loc => angularCli.generateResources.call(angularCli, resource, loc, config)
        .then(displayStatusMessage(toTileCase(resource), loc.fileName)))
      .catch(err => window.showErrorMessage(err));
  };

  for (const [key, value] of Object.entries(commandsMap)) {
    const command = commands.registerCommand(key, args => showDynamicDialog(args, value.fileName, value.resource));
    context.subscriptions.push(command);
  }
}
