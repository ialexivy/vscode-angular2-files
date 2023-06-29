import * as fs from 'fs';
import { window, workspace } from 'vscode';
import { config as defaultConfig } from './config/cli-config';
import deepMerge from './deep-merge';
import { IConfig } from './models/config';
import { AngularCliConfiguration } from './models/config-new';
import { promisify } from './promisify';
import * as dJSON from 'dirty-json';
const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {
  private currentRootPath: string = null;
  private readonly CONFIG_FILES = ['.angular-cli.json', 'angular.json'];

  private async readConfigFile(): Promise<Object> {
    const files = await workspace.findFiles('{**/.angular-cli.json,**/angular.json}', '', 1);
    const [ws] = workspace.workspaceFolders;
    this.currentRootPath = ws && ws.uri && ws.uri.path;
    if (files.length > 0) {
      const [{ 'fsPath': filePath }] = files;

      const data = await readFileAsync(filePath, 'utf8');

      let config = {};

      // prevent parsing issues
      try {
        config = dJSON.parse(data);
      } catch (ex) {
        window.showErrorMessage('Invalid schema detected in .angular.json, please correct and try again!');
        throw Error('Invalid schema');
      }

      return config;
    }

    return defaultConfig;
  }

  private parseConfig(config): IConfig {
    if (config.hasOwnProperty('projects')) {
      const oldConfig: IConfig = dJSON.parse(JSON.stringify(defaultConfig));
      const newConfig = <AngularCliConfiguration>config;

      const globalConfig = this.parseSchematicsConfig(newConfig);
      let projectName = newConfig.defaultProject;
      if(newConfig.defaultProject==null){
        projectName = Object.keys(newConfig.projects)[0];
      }
      const project = newConfig.projects[projectName];
      const projectConfig = this.parseSchematicsConfig(project);
      const prefix = project ? project.prefix : null;
      oldConfig.apps[0].prefix = prefix || oldConfig.apps[0].prefix;

      // replace global config with project config
      deepMerge(oldConfig, globalConfig, projectConfig);

      oldConfig.defaults.style = oldConfig.defaults.component.style || oldConfig.defaults.style;
      oldConfig.version = 'ng6';
      return oldConfig;
    }

    return deepMerge({}, defaultConfig, config);
  }

  private parseSchematicsConfig(cfg) {
    if (cfg && cfg.schematics) {
      const templateConfig: IConfig = dJSON.parse(JSON.stringify(defaultConfig));
      const config = {
        defaults: {
          style: '',
          component: {
            style: '',
          },
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

      config.defaults.style = config.defaults.component.style || templateConfig.defaults.component.style || templateConfig.defaults.style;

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
