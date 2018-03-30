import { IConfig } from './models/config';
import { Uri, workspace, window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { config as defaultConfig } from './config/cli-config';
import { promisify } from './promisify';
import deepMerge from './deep-merge';

const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {
  private currentRootPath: string = null;
  private readonly CONFIG_FILE = '.angular-cli.json';

  private async readConfigFile(): Promise<Object> {
    const files = await workspace.findFiles(this.CONFIG_FILE, '', 1);
    this.currentRootPath = workspace.rootPath;
    console.log(process.version);
    if (files.length > 0) {
      const [{ 'fsPath': filePath }] = files;

      const data = await readFileAsync(filePath, 'utf8');

      let config = {};

      // prevent parsing issues
      try {
        config = JSON.parse(data);
      } catch (ex) {
        window.showErrorMessage('Invalid schema detected in .angular-cli.json, please correct and try again!');
        throw Error('Invalid schema');
      }

      return config;
    }

    return defaultConfig;
  }

  private parseConfig(config): IConfig {
    return deepMerge({}, defaultConfig, config);
  }

  public async getConfig() {
    const configFile = await this.readConfigFile();
    return this.parseConfig(configFile);
  }

  public watchConfigFiles(callback) {
    if (workspace.rootPath) {
      fs.watch(workspace.rootPath, (eventType, filename) => {
        if (this.CONFIG_FILE.includes(filename)) {
          callback();
        }
      });
    }
  }
}
