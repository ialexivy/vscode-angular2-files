import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from './models/config';
import { IPath } from './models/path';
import { FileContents } from './file-contents';
import { IFiles } from './models/file';
import { promisify } from './promisify';
import { toCamelCase, toUpperCase } from './formatting';
import { createFiles, createFolder } from './ioutil';
import { TemplateType } from './template-type';

const fsWriteFile = promisify(fs.writeFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

export default class AngularCli {

  private resources = {
    module: {
      locDirName: (loc, config) => (!config.defaults.module.flat) ? loc.fileName : loc.dirName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      files: [{ name: config => `component.${config.defaults.styleExt}`, type: TemplateType.ComponentStyle },
      { name: config => `component.html`, type: TemplateType.ComponentHtml },
      { name: config => `component.ts`, type: TemplateType.Component },
      { name: config => `module.ts`, type: TemplateType.Module },
      { name: config => `component.spec.ts`, type: TemplateType.ConponentSpec, condition: config => config.defaults.module.spec }],
      createFolder: config => !config.defaults.module.flat,
    },
    enum: { files: [{ name: config => `enum.ts`, type: TemplateType.Enum }] },
    route: { files: [{ name: config => `routing.ts`, type: TemplateType.Route }] },
    interface: { files: [{ name: config => `ts`, type: TemplateType.Inteface }] },
    class: {
      files: [
        { name: config => `ts`, type: TemplateType.Class },
        { name: config => `spec.ts`, type: TemplateType.ClassSpec, condition: config => config.defaults.class.spec },
      ],
    },
    service: {
      files: [
        { name: config => `service.ts`, type: TemplateType.Service },
        { name: config => `service.spec.ts`, type: TemplateType.ServiceSpec, condition: config => config.defaults.service.spec },
      ],
    },
    pipe: {
      locDirName: (loc, config) => (!config.defaults.pipe.flat) ? loc.fileName : loc.dirName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      files: [
        { name: config => `pipe.ts`, type: TemplateType.Pipe },
        { name: config => `pipe.spec.ts`, type: TemplateType.PipeSpec, condition: config => config.defaults.pipe.spec },
      ],
      createFolder: config => !config.defaults.pipe.flat,
      declaration: 'pipe',
    },
    directive: {
      locDirName: (loc, config) => (!config.defaults.directive.flat) ? loc.fileName : loc.dirName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      declaration: 'directive',
      files: [
        { name: config => `directive.ts`, type: TemplateType.Directive },
        { name: config => `directive.spec.ts`, type: TemplateType.DirectiveSpec, condition: config => config.defaults.directive.spec },
      ],
      createFolder: config => !config.defaults.directive.flat,
    },
    component: {
      locDirName: (loc, config) => (!config.defaults.component.flat) ? loc.fileName : loc.dirName,
      locDirPath: (loc, config) => path.join(loc.dirPath, loc.dirName),
      declaration: 'component',
      files: [{ name: config => `component.ts`, type: TemplateType.Component },
      { name: config => `component.${config.defaults.styleExt}`, type: TemplateType.ComponentStyle, condition: config => !config.defaults.component.inlineStyle },
      { name: config => `component.html`, type: TemplateType.ComponentHtml, condition: config => !config.defaults.component.inlineTemplate },
      { name: config => `component.spec.ts`, type: TemplateType.ConponentSpec, condition: config => config.defaults.component.spec },
      ],
      createFolder: config => !config.defaults.component.flat,
    },
  };

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

    const lastImportInx = data.lastIndexOf('import ');
    const endOfLastImportInx = data.indexOf('\n', lastImportInx);
    const fileLength = data.length;
    return data.substring(0, endOfLastImportInx) + `\nimport { ${fileNameUpper}${typeUpper} } from '${relativePath}/${fileName}.${type}';` + data.substring(endOfLastImportInx, fileLength);
  }

  private addToDeclarations(data: string, fileName: string, type: string) {
    const typeUpper = toUpperCase(type);
    const fileNameUpper = toUpperCase(fileName);

    const declarationLastInx = data.indexOf(']', data.indexOf('declarations')) + 1;

    let before = data.substring(0, declarationLastInx);
    const after = data.substring(declarationLastInx, data.length);

    let lastDeclareInx = before.length - 1;

    while (before[lastDeclareInx] === ' ' ||
      before[lastDeclareInx] === ',' ||
      before[lastDeclareInx] === '\n' ||
      before[lastDeclareInx] === ']') {
      lastDeclareInx = lastDeclareInx - 1;
    }

    before = before.substring(0, lastDeclareInx + 1) + ',\n    ';

    return before + `${fileNameUpper}${typeUpper}\n]` + after;
  }

  private getRelativePath(dst: string, src: string) {
    const modulePath = path.parse(dst).dir;
    return '.' + src.replace(modulePath, '').replace(/\\/g, '/');
  }

  private async addDeclarationsToModule(loc: IPath, type: string) {

    const moduleFiles = [];
    await this.findModulePathRecursive(loc.rootPath, moduleFiles, (name: string) => name.indexOf('.module.ts') !== -1);

    // at least one module is there
    if (moduleFiles.length > 0) {
      moduleFiles.sort((a: string, b: string) => a.length - b.length);

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
      content = this.addToDeclarations(content, loc.fileName, type);

      await fsWriteFile(module, content);
    }
  }

  async generateResources(name: string, loc: IPath, config: IConfig) {
    const resource = this.resources[name];

    loc.dirName = resource.hasOwnProperty('locDirName') ? resource.locDirName(loc, config) : loc.dirName;
    loc.dirPath = resource.hasOwnProperty('locDirPath') ? resource.locDirPath(loc, config) : loc.dirPath;

    if (resource.hasOwnProperty('declaration') && resource.declaration) {
      await this.addDeclarationsToModule(loc, resource.declaration);
    }

    const files: IFiles[] = resource.files.filter(file => (file.condition) ? file.condition(config) : true).map((file) => {
      return {
        name: path.join(loc.dirPath, `${loc.fileName}.${file.name(config)}`),
        content: this.fc.getTemplateContent(file.type, config, loc.fileName),
      };
    });


    if (resource.hasOwnProperty('createFolder') && resource.createFolder(config)) {
      await createFolder(loc);
    }

    await createFiles(loc, files);
  }
}
