import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import { IPath } from './models/path';
import { IFiles } from './models/file';
import { promisify } from './promisify';

const fsWriteFile = promisify(fs.writeFile);
const fsExists = promisify(fs.exists);
const fsMkdir = promisify(fs.mkdir);

// Get file contents and create the new files in the folder 
export const createFiles = async (loc: IPath, files: IFiles[]) => {
  try {
    await writeFiles(files);
  } catch (ex) {
    await window.showErrorMessage(`File(s) could not be created. ${ex}`);
  }

  return loc.dirPath;
};

const writeFiles = async (files: IFiles[]) => {
  const filesPromises: Promise<any>[] = files.map(file => fsWriteFile(file.name, file.content));

  await Promise.all(filesPromises);
};


// Create the new folder
export const createFolder = async (loc: IPath) => {
  if (loc.dirName) {
    const exists: boolean = await fsExists(loc.dirPath);
    if (exists) {
      throw new Error('Folder already exists');
    }

    await fsMkdir(loc.dirPath);
  }

  return loc;
};
