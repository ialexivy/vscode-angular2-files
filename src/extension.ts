import { ConfigurationManager } from './configuration-manager';
import { AngularCli } from './angular-cli-api';
import { IPath } from './path';
import { ExtensionContext, commands, window, workspace } from 'vscode';
import * as vscode from 'vscode';

export async function activate(context: ExtensionContext) {
  let angularCli = new AngularCli();  
  let configurationManager = new ConfigurationManager();
  let config = await configurationManager.getConfig();

  //update config
  setInterval(async () => config = await configurationManager.getConfig(), 1000);

  var addAngular2Component = commands.registerCommand('extension.addAngular2Component', (args) => {
    angularCli.showFileNameDialog(args, "component", "my-component.component.ts")
      .then((loc)=> angularCli.generateComponent(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Directive = commands.registerCommand('extension.addAngular2Directive', (args) => {
    angularCli.showFileNameDialog(args, "directive", "my-directive.directive.ts")
      .then((loc)=> angularCli.generateDirective(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });


  var addAngular2Pipe = commands.registerCommand('extension.addAngular2Pipe', (args) => {
    angularCli.showFileNameDialog(args, "pipe", "my-pipe.pipe.ts")
      .then((loc)=> angularCli.generatePipe(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Service = commands.registerCommand('extension.addAngular2Service', (args) => {
    angularCli.showFileNameDialog(args, "service", "my-service.service.ts")
      .then((loc)=> angularCli.generateService(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Class = commands.registerCommand('extension.addAngular2Class', (args) => {
    angularCli.showFileNameDialog(args, "class", "my-class.class.ts")
      .then((loc)=> angularCli.generateClass(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Interface = commands.registerCommand('extension.addAngular2Interface', (args) => {
    angularCli.showFileNameDialog(args, "interface", "my-interface.interface.ts")
      .then((loc)=> angularCli.generateInterface(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Route = commands.registerCommand('extension.addAngular2Route', (args) => {
    angularCli.showFileNameDialog(args, "route", "my-route.routing.ts")
      .then((loc)=> angularCli.generateRoute(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });  

  var addAngular2Enum = commands.registerCommand('extension.addAngular2Enum', (args) => {
    angularCli.showFileNameDialog(args, "enum", "my-enum.enum.ts")
      .then((loc)=> angularCli.generateEnum(loc, config))
      .catch((err) => {
        if (err) {
          window.showErrorMessage(err);
        }
      });
  });

  var addAngular2Module = commands.registerCommand('extension.addAngular2Module', (args) => {
    angularCli.showFileNameDialog(args, "module", "my-module.module.ts")
      .then((loc)=> angularCli.generateModule(loc, config))
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
}