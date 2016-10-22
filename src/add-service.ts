import { IPath } from './path';
/// <reference path="../typings/tsd.d.ts" />
import { window, workspace, TextEditor } from 'vscode';
import { FileContents } from './file-contents';
import { IFiles } from './file';
import * as fs from 'fs';
import * as path from 'path';
import * as Q from 'q';
import * as vscode from 'vscode';

export class AddService {
  terminalStack: vscode.Terminal[] = [];
  // Show input prompt for folder name 
  // The imput is also used to create the files with the respective name as defined in the Angular2 style guide [https://angular.io/docs/ts/latest/guide/style-guide.html] 
  public showFileNameDialog(args): Q.Promise<IPath> {
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
        prompt: 'Type the name of the new service',
        value: 'my_service.service.ts'
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

  public angularCLI(loc: IPath): Q.Promise<IPath> {
    const deferred: Q.Deferred<IPath> = Q.defer<IPath>();

    //this.terminalStack.push(vscode.window.createTerminal(`Ext Terminal #${this.terminalStack.length + 1}`));

    if (this.terminalStack.length === 0) {
      vscode.window.showErrorMessage('No active terminals');
    }
    this.getLatestTerminal().sendText("echo 'Hello world!'");

    deferred.resolve(loc);

    return deferred.promise;
  }
  // Create the new folder
  public createFolder(loc: IPath): Q.Promise<IPath> {
    const deferred: Q.Deferred<IPath> = Q.defer<IPath>();

    if (loc.dirName) {
      fs.exists(loc.dirPath, (exists) => {
        if (!exists) {
          fs.mkdirSync(loc.dirPath);
          deferred.resolve(loc);
        } else {
          deferred.reject('Folder already exists');
        }
      });
    } else {
      deferred.resolve(loc);
    }

    return deferred.promise;
  }

  // Get file contents and create the new files in the folder 
  public createFiles(loc: IPath): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();

    const fc: FileContents = new FileContents();
    const af: AddService = new AddService();

    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.service.ts`),
        content: fc.serviceContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.service.spec.ts`),
        content: fc.serviceTestContent(loc.fileName)
      }
    ];

    // write files
    af.writeFiles(files).then((errors) => {
      if (errors.length > 0) {
        window.showErrorMessage(`${errors.length} file(s) could not be created. I'm sorry :-(`);
      }
      else {
        deferred.resolve(loc.dirPath);
      }
    });

    return deferred.promise;
  }

  public writeFiles(files: IFiles[]): Q.Promise<string[]> {
    const deferred: Q.Deferred<string[]> = Q.defer<string[]>();
    var errors: string[] = [];
    files.forEach(file => {
      fs.writeFile(file.name, file.content, (err) => {
        if (err) { errors.push(err.message) }
        deferred.resolve(errors);
      });
    });
    return deferred.promise;
  }

  // Open the created component in the editor
  public openFileInEditor(folderName): Q.Promise<TextEditor> {
    const deferred: Q.Deferred<TextEditor> = Q.defer<TextEditor>();
    var inputName: string = path.parse(folderName).name;;
    var fullFilePath: string = path.join(folderName, `${inputName}.component.ts`);

    workspace.openTextDocument(fullFilePath).then((textDocument) => {
      if (!textDocument) { return; }
      window.showTextDocument(textDocument).then((editor) => {
        if (!editor) { return; }
        deferred.resolve(editor);
      });
    });

    return deferred.promise;
  }

  private getLatestTerminal() {
    return this.terminalStack[this.terminalStack.length - 1];
  }
}