/// <reference path="../typings/tsd.d.ts" />
import { window, workspace, TextEditor } from 'vscode';
import { FileContentsExtended } from './file-contents-extended';
import { AddFiles } from './add-files';
import { IFiles } from './file';
import * as fs from 'fs';
import * as path from 'path';
import * as Q from 'q';

export class AddFilesExtended extends AddFiles {

  // Create the new "shared" folder for model and service
  public createFolder(folderName): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();
    var fileExists: boolean = fs.existsSync(folderName);

    if (!fileExists) {
      fs.mkdir(folderName, (err) => {
        fs.mkdirSync(path.join(folderName, 'shared'));
        deferred.resolve(folderName);
      });      
    } else {
      deferred.reject('Folder already exists');
    }
    return deferred.promise;
  }

  // Get file contents and create the new files in the folder 
  public createFiles(folderName: string): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();
    var inputName: string = path.parse(folderName).name;
    const fc: FileContentsExtended = new FileContentsExtended();
    const afe: AddFilesExtended = new AddFilesExtended();

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
      },
      {
        name: path.join(folderName, 'shared', `${inputName}.service.ts`),
        content: fc.serviceContent(inputName)
      },
      {
        name: path.join(folderName, 'shared', `${inputName}.model.ts`),
        content: fc.modelContent(inputName)
      }
    ];

    // write files
    afe.writeFiles(files).then((errors) => {
      if (errors.length > 0) {
        window.showErrorMessage(`${errors.length} file(s) could not be created. I'm sorry :-(`);
      }
      else {
        deferred.resolve(folderName);
      }
    });

    return deferred.promise;
  }

}