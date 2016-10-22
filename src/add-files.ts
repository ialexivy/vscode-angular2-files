/// <reference path="../typings/tsd.d.ts" />
import { window, workspace, TextEditor } from 'vscode';
import { FileContents } from './file-contents';
import { IFiles } from './file';
import * as fs from 'fs';
import * as path from 'path';
import * as Q from 'q';

export class AddFiles {

  // Show input prompt for folder name 
  // The imput is also used to create the files with the respective name as defined in the Angular2 style guide [https://angular.io/docs/ts/latest/guide/style-guide.html] 
  public showFileNameDialog(args): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();

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
        prompt: 'What\'s the name of the new folder?',
        value: 'folder'
      }).then(
        (fileName) => {
          if (!fileName || /[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?\s]/g.test(fileName)) {
            deferred.reject('That\'s not a valid name! (no whitespaces or special characters)');
          } else {
            deferred.resolve(path.join(newFolderPath, fileName));
          }
        },
        (error) => console.error(error)
        );
    }
    return deferred.promise;
  }

  // Create the new folder
  public createFolder(folderName): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();

    fs.exists(folderName, (exists) => {
      if (!exists) {
        fs.mkdirSync(folderName);
        deferred.resolve(folderName);
      } else {
        deferred.reject('Folder already exists');
      }      
    });
    return deferred.promise;
  }

  // Get file contents and create the new files in the folder 
  public createFiles(folderName: string): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();
    var inputName: string = path.parse(folderName).name;    
    const fc: FileContents = new FileContents();
    const af: AddFiles = new AddFiles();

    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(folderName, `${inputName}.component.ts`),
        content: fc.componentContent(inputName)
      },
      {
        name: path.join(folderName, `${inputName}.component.html`),
        content: fc.templateContent(inputName)
      },
      {
        name: path.join(folderName, `${inputName}.component.css`),
        content: fc.cssContent(inputName)
      },
      {
        name: path.join(folderName, `${inputName}.component.spec.ts`),
        content: fc.specContent(inputName)
      }
    ];

    // write files
    af.writeFiles(files).then((errors) => {
      if (errors.length > 0) {
        window.showErrorMessage(`${errors.length} file(s) could not be created. I'm sorry :-(`);
      }
      else {
        deferred.resolve(folderName);
      }
    });

    return deferred.promise;
  }

  public writeFiles( files: IFiles[]): Q.Promise<string[]> {
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

}