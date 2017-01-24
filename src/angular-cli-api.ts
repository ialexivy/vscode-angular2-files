import { IConfig } from './config';
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
  private fc = new FileContents();

  // Show input prompt for folder name 
  // The imput is also used to create the files with the respective name as defined in the Angular2 style guide [https://angular.io/docs/ts/latest/guide/style-guide.html] 
  public showFileNameDialog(args, type, defaultTypeName) : Q.Promise<IPath> {
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
            let params = fileName.split(" ");

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
              dirPath: dirPath,
              rootPath: newFolderPath,
              params: []
            });
          }
        },
        (error) => console.error(error)
        );
    }
    return deferred.promise;
  }

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
  // Create the new folder
  private createFolder(loc: IPath): Q.Promise<IPath> {
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
  private createFiles(loc: IPath, files: IFiles[]): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();

    // write files
    this.writeFiles(files).then((errors) => {
      if (errors.length > 0) {
        window.showErrorMessage(`${errors.length} file(s) could not be created. I'm sorry :-(`);
      }
      else {
        deferred.resolve(loc.dirPath);
      }
    });

    return deferred.promise;
  }

  private writeFiles(files: IFiles[]): Q.Promise<string[]> {
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



  private findModulePathRecursive(dir, fileList, optionalFilterFunction) {
    if (!fileList) {
      console.error("Variable 'fileList' is undefined or NULL.");
      return;
    }
    var files = fs.readdirSync(dir);
    for (var i in files) {
      if (!files.hasOwnProperty(i)) continue;
      var name = path.join(dir, files[i]);
      if (fs.statSync(name).isDirectory()) {
        this.findModulePathRecursive(name, fileList, optionalFilterFunction);
      } else {
        if (optionalFilterFunction && optionalFilterFunction(name) !== true)
          continue;
        fileList.push(name);
      }
    }
  }

  private camelCase(input: string): string {
    return input.replace(/-([a-z])/ig, function (all, letter) {
      return letter.toUpperCase();
    });
  }

  private toUpperCase(input: string): string {
    let inputUpperCase: string;
    inputUpperCase = input.charAt(0).toUpperCase() + input.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    return inputUpperCase;
  }

  private addToImport(data: string, fileName: string, type: string, relativePath: string): string {

    let typeUpper = this.toUpperCase(type);
    let fileNameUpper = this.toUpperCase(fileName);

    let lastImportInx = data.lastIndexOf("import ");
    let endOfLastImportInx = data.indexOf("\n", lastImportInx);
    let fileLength = data.length;
    let newData = data.substring(0, endOfLastImportInx) + `\nimport { ${fileNameUpper}${typeUpper} } from '${relativePath}/${fileName}.${type}';` + data.substring(endOfLastImportInx, fileLength);

    return newData;
  }


  private addToDeclarations(data: string, fileName: string, type: string): string {
    let typeUpper = this.toUpperCase(type);
    let fileNameUpper = this.toUpperCase(fileName);

    let declarationLastInx = data.indexOf("]", data.indexOf("declarations")) + 1;

    let before = data.substring(0, declarationLastInx);
    let after = data.substring(declarationLastInx, data.length);

    let lastDeclareInx = before.length - 1;

    while (before[lastDeclareInx] == ' ' || before[lastDeclareInx] == '\n' || before[lastDeclareInx] == ']') {
      lastDeclareInx--;
    }

    before = before.substring(0, lastDeclareInx + 1) + ',\n    ';

    let finalData = before + `${fileNameUpper}${typeUpper}\n]` + after;

    return finalData;
  }

  private getRelativePath(dst: string, src: string): string {
    let modulePath = path.parse(dst).dir;
    let relativePath = '.' + src.replace(modulePath, '').replace(/\\/g, '/');
    return relativePath;
  }

  private addDeclarationsToModule(loc: IPath, type: string) {

    let moduleFiles = [];
    this.findModulePathRecursive(loc.rootPath, moduleFiles, (name: string) => {
      return name.indexOf(".module") != -1;
    })

    //at least one module is there
    if (moduleFiles.length > 0) {
      moduleFiles.sort((a:string, b:string) => a.length - b.length);

      //find closest module      
      let module = moduleFiles[0];
      let minDistance = Infinity;

      for (let moduleFile of moduleFiles) {
        let moduleDirPath = path.parse(moduleFile).dir;
        let locPath = loc.dirPath.replace(loc.dirName, '');

        let distance = Math.abs(locPath.length - moduleDirPath.length);
        if (distance < minDistance) {
          minDistance = distance;
          module = moduleFile;
        }
      }

      fs.readFile(module, 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }

        //relativePath
        let relativePath = this.getRelativePath(module, loc.dirPath);
        let content = this.addToImport(data, loc.fileName, type, relativePath);
        content = this.addToDeclarations(content, loc.fileName, type);

        fs.writeFile(module, content, function (err) {
          err || console.log('Data replaced \n', content);
        });

      });
    }
  }

  public generateComponent = async (loc: IPath, config: IConfig) => {
    loc.dirName = loc.fileName;
    loc.dirPath = path.join(loc.dirPath, loc.dirName);

    this.addDeclarationsToModule(loc, "component");

    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.${config.styleExt}`),
        content: this.fc.componentCSSContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.html`),
        content: this.fc.componentHTMLContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.ts`),
        content: this.fc.componentContent(loc.fileName, config)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.spec.ts`),
        content: this.fc.componentTestContent(loc.fileName)
      }
    ];

    await this.createFolder(loc);
    await this.createFiles(loc, files);
  }

  public generateDirective = async (loc: IPath, config: IConfig) => {

    this.addDeclarationsToModule(loc, "directive");

    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.directive.ts`),
        content: this.fc.directiveContent(loc.fileName, config)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.directive.spec.ts`),
        content: this.fc.directiveTestContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }

  public generatePipe = async (loc: IPath, config: IConfig) => {
    this.addDeclarationsToModule(loc, "pipe");

    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.pipe.ts`),
        content: this.fc.pipeContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.pipe.spec.ts`),
        content: this.fc.pipeTestContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }
  public generateService = async (loc: IPath, config: IConfig) => {
    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.service.ts`),
        content: this.fc.serviceContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.service.spec.ts`),
        content: this.fc.serviceTestContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }

  public generateClass = async (loc: IPath, config: IConfig) => {
    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.ts`),
        content: this.fc.classContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }
  public generateInterface = async (loc: IPath, config: IConfig) => {
    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.ts`),
        content: this.fc.interfaceContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }
  
  public generateRoute= async (loc: IPath, config: IConfig) => {
    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.routing.ts`),
        content: this.fc.routeContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }

  public generateEnum = async (loc: IPath, config: IConfig) => {
    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.enum.ts`),
        content: this.fc.enumContent(loc.fileName)
      }
    ];

    await this.createFiles(loc, files);
  }
  public generateModule = async (loc: IPath, config: IConfig) => {
    loc.dirName = loc.fileName;
    loc.dirPath = path.join(loc.dirPath, loc.dirName);

    // create an IFiles array including file names and contents
    var files: IFiles[] = [
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.${config.styleExt}`),
        content: this.fc.componentCSSContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.html`),
        content: this.fc.componentHTMLContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.ts`),
        content: this.fc.componentContent(loc.fileName, config)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.component.spec.ts`),
        content: this.fc.componentTestContent(loc.fileName)
      },
      {
        name: path.join(loc.dirPath, `${loc.fileName}.module.ts`),
        content: this.fc.moduleContent(loc.fileName)
      }
    ];

    await this.createFolder(loc);
    await this.createFiles(loc, files);
  }
}
