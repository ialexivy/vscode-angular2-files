import { IPath } from './path';
/// <reference path="../typings/tsd.d.ts" />
import { window, workspace, TextEditor } from 'vscode';
import { FileContents } from './file-contents';
import { IFiles } from './file';
import * as fs from 'fs';
import * as path from 'path';
import * as Q from 'q';
import * as vscode from 'vscode';

export class AngularCli {
  constructor(private terminal: vscode.Terminal) {

  }
  // Show input prompt for folder name 
  // The imput is also used to create the files with the respective name as defined in the Angular2 style guide [https://angular.io/docs/ts/latest/guide/style-guide.html] 
  public showFileNameDialog(args, type, defaultTypeName): Q.Promise<IPath> {
    const deferred: Q.Deferred<IPath> = Q.defer<IPath>();

    var clickedFolderPath: string;
    if (args) {
      clickedFolderPath = args.fsPath
    }
    else {
      if (!window.activeTextEditor) {
        deferred.reject('Please open a file first.. or just right-click on a file/folder and use the context menu!');
        return deferred.promise;
      } else {
        clickedFolderPath = path.dirname(window.activeTextEditor.document.fileName);
      }
    }
    var newFolderPath: string = fs.lstatSync(clickedFolderPath).isDirectory() ? clickedFolderPath : path.dirname(clickedFolderPath);

    if (workspace.rootPath === undefined) {
      deferred.reject('Please open a project first. Thanks! :-)');
    }
    else {
      window.showInputBox({
        prompt: `Type the name of the new ${type}`,
        value: `${defaultTypeName}`
      }).then(
        (fileName) => {
          if (!fileName) {
            deferred.reject('That\'s not a valid name! (no whitespaces or special characters)');
          } else {
            let dirName = '';
            let dirPath = '';
            let fullPath = path.join(newFolderPath, fileName);
            if (fileName.indexOf("\\") != -1) {
              let pathParts = fileName.split("\\");
              dirName = pathParts[0];
              fileName = pathParts[1];
            }
            dirPath = path.join(newFolderPath, dirName);

            deferred.resolve({
              fullPath: fullPath,
              fileName: fileName,
              dirName: dirName,
              dirPath: dirPath
            });
          }
        },
        (error) => console.error(error)
        );
    }
    return deferred.promise;
  }

  public generateComponent = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g c ${loc.fileName}`);
  }
  public generateDirective = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g d ${loc.fileName}`);
  }
  public generatePipe = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g p ${loc.fileName}`);
  }
  public generateService = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g s ${loc.fileName}`);
  }
  public generateClass = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g class ${loc.fileName}`);
  }
  public generateInterface = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g interface ${loc.fileName}`);
  }
  public generateEnum = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g enum ${loc.fileName}`);
  }
  public generateModule = (loc: IPath) => {
    this.terminal.sendText(`cd ${loc.dirPath} & ng g module ${loc.fileName}`);
  }
}