import { ConfigurationManager } from './configuration-manager';
import AngularCli from './Angular-Cli';
import { IPath } from './models/path';
import { ExtensionContext, commands, window, workspace } from 'vscode';

const displayStatusMessage = (type: string, name: string, timeout = 2000) => window.setStatusBarMessage(`${type} ${name} was successfully generated`, timeout);
const toTileCase = (str: string) => str.replace(/\w\S*/g, (txt) => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

export async function activate(context: ExtensionContext) {
  console.time('activate');
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  let config = {};

  setImmediate(async () => config = await cm.getConfig());

  // watch and update on config file changes
  cm.watchConfigFiles(async () => config = await cm.getConfig());

  const commandsMap = {
    'extension.addAngular2Component': { template: 'component', fileName: 'my-component.component.ts', callback: angularCli.generateComponent },
    'extension.addAngular2Directive': { template: 'directive', fileName: 'my-directive.directive.ts', callback: angularCli.generateDirective },
    'extension.addAngular2Pipe': { template: 'pipe', fileName: 'my-pipe.pipe.ts', callback: angularCli.generatePipe },
    'extension.addAngular2Service': { template: 'service', fileName: 'my-service.service.ts', callback: angularCli.generateService },
    'extension.addAngular2Class': { template: 'class', fileName: 'my-class.class.ts', callback: angularCli.generateClass },
    'extension.addAngular2Interface': { template: 'interface', fileName: 'my-interface.interface.ts', callback: angularCli.generateInterface },
    'extension.addAngular2Route': { template: 'route', fileName: 'my-route.routing.ts', callback: angularCli.generateRoute },
    'extension.addAngular2Enum': { template: 'enum', fileName: 'my-enum.enum.ts', callback: angularCli.generateEnum },
    'extension.addAngular2Module': { template: 'module', fileName: 'my-module.module.ts', callback: angularCli.generateModule },
  };

  const showDynamicDialog = (args, template, fileName, callback) => {
    angularCli.showFileNameDialog(args, template, fileName)
      .then(loc => callback.call(angularCli, loc, config)
        .then(displayStatusMessage(toTileCase(template), loc.fileName)))
      .catch(err => window.showErrorMessage(err));
  };

  for (const [key, value] of Object.entries(commandsMap)) {
    const command = commands.registerCommand(key, args => showDynamicDialog(args, value.template, value.fileName, value.callback));
    context.subscriptions.push(command);
  }
  console.timeEnd('activate');
}
