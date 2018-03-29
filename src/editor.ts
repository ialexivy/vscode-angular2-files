import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IPath } from './models/path';

export const displayStatusMessage = (type: string, name: string, timeout = 2000) => window.setStatusBarMessage(`${type} ${name} was successfully generated`, timeout);

export const openFileInEditor = async (folderName) => {
  const inputName = path.parse(folderName).name;
  const fullFilePath = path.join(folderName, `${inputName}.component.ts`);
  const textDocument = await workspace.openTextDocument(fullFilePath);
  return await window.showTextDocument(textDocument);
};

// Show input prompt for folder name 
export const showFileNameDialog = async (args, type, defaultTypeName): Promise<IPath> => {
  let clickedFolderPath: string;
  if (args) {
    clickedFolderPath = args.fsPath;
  } else {
    if (!window.activeTextEditor) {
      throw new Error('Please open a file first.. or just right-click on a file/folder and use the context menu!');
    } else {
      clickedFolderPath = path.dirname(window.activeTextEditor.document.fileName);
    }
  }

  const rootPath = fs.lstatSync(clickedFolderPath).isDirectory() ? clickedFolderPath : path.dirname(clickedFolderPath);

  if (workspace.rootPath === undefined) {
    throw new Error('Please open a project first. Thanks! :-)');
  } else {
    let fileName = await window.showInputBox({ prompt: `Type the name of the new ${type}`, value: `${defaultTypeName}` });

    if (!fileName) {
      throw new Error('That\'s not a valid name! (no whitespaces or special characters)');
    } else {
      let dirName = '';

      const fullPath = path.join(rootPath, fileName);

      if (fileName.indexOf('\\') !== -1) {
        [dirName, fileName] = fileName.split('\\');
      }
      const dirPath = path.join(rootPath, dirName);

      return {
        fullPath,
        fileName,
        dirName,
        dirPath,
        rootPath,
        params: [],
      };
    }
  }
};
