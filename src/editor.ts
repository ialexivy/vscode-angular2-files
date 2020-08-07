import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IPath } from './models/path';
import { OptionType } from './enums/option-type';
import { ResourceType } from './enums/resource-type';
import { resources } from './resources';
import { optionsCommands } from './option-commands';
import { IConfig } from './models/config';
import { OptionItem } from './models/option-item';
import * as dJSON from 'dirty-json';

export const displayStatusMessage = (type: string, name: string, timeout = 2000) => vscode.window.setStatusBarMessage(`${type} ${name} was successfully generated`, timeout);

export const openFileInEditor = async (folderName) => {
  const inputName = path.parse(folderName).name;
  const fullFilePath = path.join(folderName, `${inputName}.component.ts`);
  const textDocument = await vscode.workspace.openTextDocument(fullFilePath);
  return await vscode.window.showTextDocument(textDocument);
};

// Show input prompt for folder name 
export const showFileNameDialog = async (args, type: ResourceType, defaultTypeName): Promise<IPath> => {
  let clickedFolderPath: string;
  if (args) {
    clickedFolderPath = args.fsPath;
  } else {
    if (!vscode.window.activeTextEditor) {
      throw new Error('Please open a file first.. or just right-click on a file/folder and use the context menu!');
    } else {
      clickedFolderPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
    }
  }

  const rootPath = fs.lstatSync(clickedFolderPath).isDirectory() ? clickedFolderPath : path.dirname(clickedFolderPath);

  if (vscode.workspace.rootPath === undefined) {
    throw new Error('Please open a project first. Thanks! :-)');
  } else {
    let fileName = await vscode.window.showInputBox({ prompt: `Type the name of the new ${type}`, value: `${defaultTypeName}` });

    if (!fileName) {
      throw new Error('That\'s not a valid name! (no whitespaces or special characters)');
    } else {
      let dirName = '';

      const [showOptionsCmd] = optionsCommands.get(OptionType.ShowOptions).commands;
      const resoureParamsMap = resources.get(type).options ? resources.get(type).options.map(op => optionsCommands.get(op).commands.map(v => [v, op] as [string, OptionType])) : [];
      const optionsMap = new Map<string, OptionType>(Array.prototype.concat.apply([], [...resoureParamsMap, [[showOptionsCmd, OptionType.ShowOptions]]]));
      const resourceOptionsTags = resources.get(type).options ? Array.prototype.concat.apply([], resources.get(type).options.map(op => optionsCommands.get(op).commands)) : [];

      const separators = ['--', ' -'];
      const optionValuesSparator = ['=', ' '];
      const filenameTokens = fileName.split(' ');
      const optionsString = filenameTokens.slice(1, filenameTokens.length).join(' ');
      [fileName] = filenameTokens;

      const optionsTokens = optionsString.split(new RegExp(separators.join('|'), 'g'))
        .filter(item => item.trim() !== '')
        .map(item => item.trim())
        .map(item => (item.length === 2) ?  item : '-' + item);

      const params = optionsTokens
        .filter((t) => {
          const [option] = t.split(new RegExp(optionValuesSparator.join('|'), 'g'));
          return resourceOptionsTags.includes(option) || option === showOptionsCmd;
        })
        .map((t) => {
          const [key, value = 'True'] = t.split(new RegExp(optionValuesSparator.join('|'), 'g'));

          return [optionsMap.get(key), value] as [OptionType, string];
        });

      const paramsMap = new Map<OptionType, string>(params);
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
        paramsMap,
        params: [...paramsMap.keys()],
      };
    }
  }
};

const deepValue = (obj, path) => {
  const parts = path.split('.');
  let rv;
  let index;
  // tslint:disable-next-line:no-increment-decrement
  for (rv = obj, index = 0; rv && index < parts.length; ++index) {
    rv = rv[parts[index]];
  }
  return rv;
};



export const showOptionsDialog = async (config: IConfig, loc: IPath, resource: ResourceType): Promise<any> => {
  const resourceOptions = resources.get(resource).options;
  if (!resourceOptions) {
    return null;
  }

  const optionMap = new Map<string, OptionType>(resourceOptions.map((op) => {
    const optionItem = optionsCommands.get(op);
    const [optionCommand] = optionItem.commands;
    const optionName = optionCommand.replace('--', '');
    return [optionName, op] as [string, OptionType];
  }));

  const resourceOptionsChoices = [...optionMap.entries()].map((option) => {
    const [optionName, optionType] = option;
    const optionItem = optionsCommands.get(optionType);
    const resourceConfigPath = optionItem.configPath ? optionItem.configPath.replace('{resource}', resource.toLocaleLowerCase()) : '';
    const optionConfiguredDefaultValue = (optionItem.configPath) ? deepValue(config, resourceConfigPath) || '' : '';
    const selectedValue = loc.paramsMap.has(optionType) ? loc.paramsMap.get(optionType) : '';
    const optionDefaultValue = selectedValue || optionConfiguredDefaultValue;

    const displayValue = (optionDefaultValue && optionDefaultValue !== '') ? `${optionName} (default: ${optionDefaultValue})` : optionName;
    return { label: displayValue, description: optionItem.description, picked: loc.params.includes(optionType) } as vscode.QuickPickItem;
  });

  const selectedOptions = await vscode.window.showQuickPick(resourceOptionsChoices, { canPickMany: true, placeHolder: `Select ${resource} options to override` });
  const selectedOptionTypes = selectedOptions.map(o => o.label.split(' ')[0].trim())
    .map(l => optionMap.get(l));

  return selectedOptionTypes;
};

const asyncForEach = async (array, callback) => {
  // tslint:disable-next-line:no-increment-decrement
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const configureOptionsValues = async (config: IConfig, loc: IPath, resource: ResourceType, optionTypes: OptionType[]): Promise<Map<OptionType, string>> => {
  const optionsValuesMap = new Map<OptionType, string>();
  await asyncForEach(optionTypes, async (ot) => {
    const optionItem = optionsCommands.get(ot);
    const resourceConfigPath = optionItem.configPath ? optionItem.configPath.replace('{resource}', resource.toLocaleLowerCase()) : '';
    const optionDefaultValue = (optionItem.configPath) ? deepValue(config, resourceConfigPath) || '' : '';
    const [command] = optionItem.commands;
    const items = optionItem.type ? optionItem.type.split('|').map(item => item.trim()) : [];
    const [firstItem = ''] = items;
    const sortedItems = firstItem.toLowerCase() === optionDefaultValue.toString().toLowerCase() ? items.reverse() : items;

    const selectedValue = loc.paramsMap.has(ot) ? loc.paramsMap.get(ot) : '';
    const params = { placeHolder: `${command}: ${optionItem.description}`, value: selectedValue };

    const val = (optionItem.type) ? await vscode.window.showQuickPick(sortedItems, params) : await vscode.window.showInputBox(params);
    optionsValuesMap.set(ot, val);
  });
  return optionsValuesMap;
};


const setToValue = (obj, value, path) => {
  let i;
  let localObj = obj;
  const localPath = path.split('.');

  // tslint:disable-next-line:no-increment-decrement
  for (i = 0; i < localPath.length - 1; i++) {
    localObj = localObj[localPath[i]];
  }

  localObj[localPath[i]] = value;
};

const parseOptionValue = value => ['True', 'False'].includes(value) ? dJSON.parse(value.toLocaleLowerCase()) : value;

export const mapConfigValues = (config: IConfig, resource: ResourceType, optionsValuesMap: Map<OptionType, string>) => {
  const newConfig = dJSON.parse(JSON.stringify(config));

  optionsValuesMap.forEach((val, key) => {
    const optionItem = optionsCommands.get(key);
    const optionValue = parseOptionValue(val);
    const resourceConfigPath = optionItem.configPath ? optionItem.configPath.replace('{resource}', resource.toLocaleLowerCase()) : '';

    setToValue(newConfig, optionValue, resourceConfigPath);
  });

  return newConfig;
};

export const showWarning = async (): Promise<any> => {
  vscode.window.showInformationMessage('Please install latest version of vscode', 'Got It');
};
