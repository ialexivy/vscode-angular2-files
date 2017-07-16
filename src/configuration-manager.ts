import { IConfig } from './models/config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { config as defaultConfig } from './config/cli-config';
import mergeDeep from './deep-merge';

export class ConfigurationManager {
    private currentRootPath: string = null;
    private readonly CONFIG_FILE = '.angular-cli.json';

    private readConfigFile(): Promise<Object> {

        return new Promise((resolve, reject) => {
            vscode.workspace.findFiles(this.CONFIG_FILE, '', 1).then((result: vscode.Uri[]) => {
                this.currentRootPath = vscode.workspace.rootPath;

                if (result.length > 0) {
                    let [{ 'fsPath': filePath }] = result;
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) throw err;

                        let config = {};

                        //prevent parsing issues
                        try {
                            config = JSON.parse(data);
                        } catch (ex) {
                            vscode.window.showErrorMessage('Invalid schema detected in .angular-cli.json, please correct and try again!')
                            reject();
                        }

                        resolve(config);
                    });

                } else {
                    resolve(defaultConfig);
                }
            }, (reason: any) => reject(reason));
        });
    }

    private parseConfig(config): IConfig {
        const projectConfig = mergeDeep({}, defaultConfig, config);
        console.log(projectConfig);
        return projectConfig;
    }

    public async getConfig() {
        let configFile = await this.readConfigFile();
        return this.parseConfig(configFile);
    }


    public watchConfigFiles(callback) {
        fs.watch(vscode.workspace.rootPath, (eventType, filename) => {
            if (this.CONFIG_FILE.includes(filename)) {
                callback();
            }
        });
    }
}