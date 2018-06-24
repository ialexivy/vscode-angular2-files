import { IConfig } from './models/config';
import { Uri, workspace, window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { config as defaultConfig } from './config/cli-config';
import { promisify } from './promisify';
import deepMerge from './deep-merge';
import { AngularCliConfiguration } from './models/config-new';

const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {
  private currentRootPath: string = null;
  private readonly CONFIG_FILES = ['.angular-cli.json', 'angular.json'];

  private async readConfigFile(): Promise<Object> {
    const files = await workspace.findFiles('{**/.angular-cli.json,**/angular.json}', '', 1);
    this.currentRootPath = workspace.rootPath;
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
    if (config.hasOwnProperty('projects')) {
      const oldConfig: IConfig = JSON.parse(JSON.stringify(defaultConfig));
      const newConfig = <AngularCliConfiguration>config;

      const globalConfig = this.parseSchematicsConfig(newConfig);
      const project = newConfig.projects[newConfig.defaultProject];
      const projectConfig = this.parseSchematicsConfig(project);

      // replace global config with project config
      deepMerge(oldConfig, globalConfig, projectConfig);

      oldConfig.defaults.styleExt = oldConfig.defaults.component.styleext || oldConfig.defaults.styleExt;
      oldConfig.version = 'ng6';
      return oldConfig;
    }

    return deepMerge({}, defaultConfig, config);
  }

  private parseSchematicsConfig(cfg) {
    if (cfg && cfg.schematics) {
      const templateConfig: IConfig = JSON.parse(JSON.stringify(defaultConfig));
      const config = {
        defaults: {
          styleExt: '',
        },
      };

      for (const key of Object.keys(cfg.schematics)) {
        const normalizedKey = key.replace('@schematics/angular:', '');
        for (const prop of Object.keys(cfg.schematics[key])) {
          if (templateConfig.defaults[normalizedKey] && templateConfig.defaults[normalizedKey].hasOwnProperty(prop)) {
            if (!config.defaults.hasOwnProperty(normalizedKey)) {
              config.defaults[normalizedKey] = {};
            }

            config.defaults[normalizedKey][prop] = cfg.schematics[key][prop];
          }
        }
      }

      config.defaults.styleExt = templateConfig.defaults.component.styleext || templateConfig.defaults.styleExt;

      return config;
    }

    return null;
  }

  public async getConfig() {
    const configFile = await this.readConfigFile();
    return this.parseConfig(configFile);
  }

  public watchConfigFiles(callback) {
    if (workspace.rootPath) {
      fs.watch(workspace.rootPath, (eventType, filename) => {
        if (this.CONFIG_FILES.includes(filename)) {
          callback();
        }
      });
    }
  }
}
