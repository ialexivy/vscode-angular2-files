import * as fs from 'fs';
import * as path from 'path';
import { ResourceType } from './enums/resource-type';
import { FileContents } from './file-contents';
import { toUpperCase } from './formatting';
import { createFiles, createFolder } from './ioutil';
import { IConfig } from './models/config';
import { IFiles } from './models/file';
import { IPath } from './models/path';
import { addToImport, addToType } from './ng-module-utils';
import { promisify } from './promisify';
import { resources } from './resources';

const fsWriteFile = promisify(fs.writeFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

export class AngularCli {


  constructor(private readonly fc = new FileContents()) {
    fc.loadTemplates();
  }

  private async findModulePathRecursive(dir, fileList, optionalFilterFunction) {
    if (!fileList) {
      console.error('Variable \'fileList\' is undefined or NULL.');
      return;
    }
    const files: string[] = await fsReaddir(dir);
    for (const i in files) {
      if (!files.hasOwnProperty(i)) {
        continue;
      }
      const name = path.join(dir, files[i]);
      const stat: fs.Stats = await fsStat(name);

      if (stat.isDirectory()) {
        await this.findModulePathRecursive(name, fileList, optionalFilterFunction);
      } else {
        if (optionalFilterFunction && optionalFilterFunction(name) !== true) {
          continue;
        }
        fileList.push(name);
      }
    }
  }

  private addToImport(data: string, fileName: string, type: string, relativePath: string) {
    const typeUpper = toUpperCase(type);
    const fileNameUpper = toUpperCase(fileName);

    return addToImport(data, `import { ${fileNameUpper}${typeUpper} } from '${relativePath}/${fileName}.${type}';`);
  }

  private addToArray(content, fileName: string, type: string, prop: string) {
    const item = `${toUpperCase(fileName)}${toUpperCase(type)}`;
    return addToType(content, prop, item);
  }

  private getRelativePath(dst: string, src: string) {
    const modulePath = path.parse(dst).dir;
    return '.' + src.replace(modulePath, '').replace(/\\/g, '/');
  }

  private async addDeclarationsToModule(loc: IPath, type: string, module: string, exports: boolean = false) {
    const condition = (name: string) => module ? name.includes(`${module}.module.ts`) : name.includes('.module.ts');

    const moduleFiles = [];
    await this.findModulePathRecursive(loc.rootPath, moduleFiles, condition);

    // at least one module is there
    if (moduleFiles.length > 0) {
      moduleFiles.sort((a: string, b: string) => path.dirname(a).length - path.dirname(b).length);

      // find closest module      
      let [module] = moduleFiles;
      let minDistance = Infinity;

      for (const moduleFile of moduleFiles) {
        const moduleDirPath = path.parse(moduleFile).dir;
        const locPath = loc.dirPath.replace(loc.dirName, '');

        const distance = Math.abs(locPath.length - moduleDirPath.length);
        if (distance < minDistance) {
          minDistance = distance;
          module = moduleFile;
        }
      }

      const data: string = await fsReadFile(module, 'utf8');

      // relativePath
      const relativePath = this.getRelativePath(module, loc.dirPath);
      let content = this.addToImport(data, loc.fileName, type, relativePath);

      content = this.addToArray(content, loc.fileName, type, 'declarations');
      if (exports) {
        content = this.addToArray(content, loc.fileName, type, 'exports');
      }

      await fsWriteFile(module, content);
    }
  }

  async generateResources(name: ResourceType, loc: IPath, config: IConfig) {
    const resource = resources.get(name);

    loc.dirName = resource.hasOwnProperty('locDirName') ? resource.locDirName(loc, config) : loc.dirName;
    loc.dirPath = resource.hasOwnProperty('locDirPath') ? resource.locDirPath(loc, config) : loc.dirPath;

    if (resource.hasOwnProperty('declaration') &&
      resource.declaration &&
      !config.defaults[name].skipImport) {
      await this.addDeclarationsToModule(loc, resource.declaration, config.defaults[name].module, config.defaults[name].export);
    }

    const files: IFiles[] = resource.files.filter(file => (file.condition) ? file.condition(config, loc.params) : true).map((file) => {
      const fileName: string = file.name(config);
      return {
        name: path.join(loc.dirPath, fileName.startsWith('-') ? `${loc.fileName}${fileName}` : `${loc.fileName}.${fileName}`),
        content: this.fc.getTemplateContent(file.type, config, loc.fileName, loc.params),
      };
    });


    if (resource.hasOwnProperty('createFolder') && resource.createFolder(config)) {
      await createFolder(loc);
    }

    await createFiles(loc, files);
  }
}
