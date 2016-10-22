import { AngularCli } from './angular-cli-api';
import { IPath } from './path';
import { ExtensionContext, commands, window } from 'vscode';
import { AddFiles } from './add-files';
import { AddFilesExtended } from './add-files-extended';
import * as vscode from 'vscode';

export function activate(context: ExtensionContext) {
  let terminalStack: vscode.Terminal[] = [];
  const terminal = vscode.window.createTerminal('Angular CLI');
  const angularCli: AngularCli = new AngularCli(terminal);
  console.log('Congratulations, your extension is now active!');


  var addAngular2Component = commands.registerCommand('extension.addAngular2Component', (args) => {
    angularCli.showFileNameDialog(args, "component", "my-component.component.ts")
      .then(angularCli.generateComponent)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Directive = commands.registerCommand('extension.addAngular2Directive', (args) => {
    angularCli.showFileNameDialog(args, "directive", "my-directive.directive.ts")
      .then(angularCli.generateDirective)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });


  var addAngular2Pipe = commands.registerCommand('extension.addAngular2Pipe', (args) => {
    angularCli.showFileNameDialog(args, "pipe", "my-pipe.pipe.ts")
      .then(angularCli.generatePipe)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Service = commands.registerCommand('extension.addAngular2Service', (args) => {
    angularCli.showFileNameDialog(args, "service", "my-service.service.ts")
      .then(angularCli.generateService)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Class = commands.registerCommand('extension.addAngular2Class', (args) => {
    angularCli.showFileNameDialog(args, "class", "my-class.class.ts")
      .then(angularCli.generateClass)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Interface = commands.registerCommand('extension.addAngular2Interface', (args) => {
    angularCli.showFileNameDialog(args, "interface", "my-interface.interface.ts")
      .then(angularCli.generateInterface)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Enum = commands.registerCommand('extension.addAngular2Enum', (args) => {
    angularCli.showFileNameDialog(args, "enum", "my-enum.enum.ts")
      .then(angularCli.generateEnum)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Module = commands.registerCommand('extension.addAngular2Module', (args) => {
    angularCli.showFileNameDialog(args, "module", "my-module.module.ts")
      .then(angularCli.generateModule)
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  context.subscriptions.push(addAngular2Component);
  context.subscriptions.push(addAngular2Directive);
  context.subscriptions.push(addAngular2Pipe);
  context.subscriptions.push(addAngular2Service);
  context.subscriptions.push(addAngular2Class);
  context.subscriptions.push(addAngular2Interface);
  context.subscriptions.push(addAngular2Enum);
  context.subscriptions.push(addAngular2Module);




  function getLatestTerminal() {
    return terminalStack[terminalStack.length - 1];
  }
}