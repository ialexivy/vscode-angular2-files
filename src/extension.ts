import { ExtensionContext, commands, window, workspace } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import { IPath } from './models/path';
import { showFileNameDialog, displayStatusMessage } from './editor';
import { toTileCase } from './formatting';
import AngularCli from './Angular-Cli';

export async function activate(context: ExtensionContext) {
  console.time('activate');
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  let config = {};

  setImmediate(async () => config = await cm.getConfig());

  // watch and update on config file changes
  cm.watchConfigFiles(async () => config = await cm.getConfig());

  const commandsMap = {
    'extension.addAngular2Component': { template: 'component', fileName: 'my-component.component.ts', resource: 'component' },
    'extension.addAngular2Directive': { template: 'directive', fileName: 'my-directive.directive.ts', resource: 'directive' },
    'extension.addAngular2Pipe': { template: 'pipe', fileName: 'my-pipe.pipe.ts', resource: 'pipe' },
    'extension.addAngular2Service': { template: 'service', fileName: 'my-service.service.ts', resource: 'service' },
    'extension.addAngular2Class': { template: 'class', fileName: 'my-class.class.ts', resource: 'class' },
    'extension.addAngular2Interface': { template: 'interface', fileName: 'my-interface.interface.ts', resource: 'interface' },
    'extension.addAngular2Route': { template: 'route', fileName: 'my-route.routing.ts', resource: 'route' },
    'extension.addAngular2Enum': { template: 'enum', fileName: 'my-enum.enum.ts', resource: 'enum' },
    'extension.addAngular2Module': { template: 'module', fileName: 'my-module.module.ts', resource: 'module' },
  };

  const showDynamicDialog = (args, template, fileName, resource) => {
    showFileNameDialog(args, template, fileName)
      .then(loc => angularCli.generateResources.call(angularCli, resource, loc, config)
        .then(displayStatusMessage(toTileCase(template), loc.fileName)))
      .catch(err => window.showErrorMessage(err));
  };

  for (const [key, value] of Object.entries(commandsMap)) {
    const command = commands.registerCommand(key, args => showDynamicDialog(args, value.template, value.fileName, value.resource));
    context.subscriptions.push(command);
  }
  console.timeEnd('activate');
}
