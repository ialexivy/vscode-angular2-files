import { IConfig } from './config';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Q from 'q';

export class ConfigurationManager{
  private readConfigFile(): Q.Promise<Object> {
    const deferred: Q.Deferred<Object> = Q.defer<Object>();
    const configFileName = 'angular-cli.json';
        vscode.workspace.findFiles(configFileName, '', 1).then(
        // all good
        (result: vscode.Uri[]) => {
            if(result.length > 0){
              let filePath = result[0].fsPath;

              var obj;
              fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) throw err;
                obj = JSON.parse(data);
                deferred.resolve(obj);
              });

            }else{
                //create file
                 deferred.resolve({"apps": [{ "root": "src", "prefix": "app" }],  "defaults": { "styleExt": "css" }});
            }
        },
        // rejected
        (reason: any) => {
           deferred.reject(reason);
        });

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