import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as path from 'path';
export const openFileInEditor = async (folderName) => {
  const inputName = path.parse(folderName).name;
  const fullFilePath = path.join(folderName, `${inputName}.component.ts`);
  const textDocument = await workspace.openTextDocument(fullFilePath);
  return await window.showTextDocument(textDocument);
};
