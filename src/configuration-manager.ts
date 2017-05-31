import { IConfig } from './models/config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { config as defaultConfig } from './config/cli-config';

export class ConfigurationManager {
    private currentRootPath: string = null;
    private config: Object = null;
    private readonly CONFIG_FILE = '.angular-cli.json';

    private readConfigFile(): Promise<Object> {

        return new Promise((resolve, reject) => {
            if (vscode.workspace.rootPath != this.currentRootPath) {
                vscode.workspace.findFiles(this.CONFIG_FILE, '', 1).then(
                    // all good
                    (result: vscode.Uri[]) => {
                        //set root
                        this.currentRootPath = vscode.workspace.rootPath;

                        if (result.length > 0) {
                            let filePath = result[0].fsPath;

                            var obj;
                            fs.readFile(filePath, 'utf8', (err, data) => {
                                if (err) throw err;
                                obj = JSON.parse(data);
                                this.config = obj;
                                resolve(this.config);
                            });

                        } else {
                            fs.writeFile(path.join(vscode.workspace.rootPath, this.CONFIG_FILE), JSON.stringify(defaultConfig, null, 2), (err) => { });
                            this.config = defaultConfig;
                            resolve(this.config);
                        }
                    },
                    // rejected
                    (reason: any) => reject(reason));
            } else {
                resolve(this.config);
            }
        });
    }

    private parseConfig(config): IConfig {
        return {
            rootPath: config.apps[0].root,
            prefix: config.apps[0].prefix,
            styleExt: config.defaults.styleExt
        };
    }

    public async getConfig() {
        let configFile = await this.readConfigFile();
        let config = this.parseConfig(configFile);

        return config;
    }


    public watchConfigFiles(callback) {
        fs.watch(vscode.workspace.rootPath, (eventType, filename) => {
            if (this.CONFIG_FILE.includes(filename)) {
                callback();
            }
        });
    }
}