import { IConfig } from './config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Q from 'q';

export class ConfigurationManager{
  private currentRootPath: string = null;
  private config: Object = null;

  private readConfigFile(): Q.Promise<Object> {
    const deferred: Q.Deferred<Object> = Q.defer<Object>();
    const configFileName = 'angular-cli.json';

    if(vscode.workspace.rootPath != this.currentRootPath){
            vscode.workspace.findFiles(configFileName, '', 1).then(
            // all good
            (result: vscode.Uri[]) => {
                //set root
                this.currentRootPath = vscode.workspace.rootPath;

                if(result.length > 0){
                let filePath = result[0].fsPath;

                var obj;
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) throw err;
                    obj = JSON.parse(data);
                    this.config= obj;
                    deferred.resolve(this.config);
                });

                }else{
                    //create file
                    this.config = {"apps": [{ "root": "src", "prefix": "app" }],  "defaults": { "styleExt": "css" }};
                    deferred.resolve(this.config);
                }
            },
            // rejected
            (reason: any) => {
            deferred.reject(reason);
            });
    }else{
            deferred.resolve(this.config);
    }

    return deferred.promise;
  }

  private parseConfig(config) : IConfig{
      return {
            rootPath: config.apps[0].root,
            prefix:config.apps[0].prefix,
            styleExt: config.defaults.styleExt
      };
  }

  public async getConfig(){
      let configFile = await this.readConfigFile();
      let config = this.parseConfig(configFile);
      
      return config;
  }    
}