import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mocha from 'mocha';
import * as path from 'path';
import { AngularCli } from './../src/angular-cli';
import { IConfig } from './../src/models/config';
import { IPath } from './../src/models/path';
import { config as defaultConfig } from './../src/config/cli-config';
import { resources } from './../src/resources';
import { ResourceType } from './../src/enums/resource-type';
import * as dJSON from 'dirty-json';

chai.use(sinonChai);

const expect = chai.expect;
let config: IConfig = dJSON.parse(JSON.stringify(defaultConfig));
const testPath = path.join(__dirname, 'app');
const angularCli = new AngularCli();

describe('Extension Tests:', () => {
  before(() => {
    if (!fs.existsSync(testPath)) {
      fs.mkdirSync(testPath);
    }
  });

  beforeEach(() => {
    config = dJSON.parse(JSON.stringify(defaultConfig));
  });

  afterEach(() => {
    rimraf.sync(`${testPath}/**/*`);
  });

  after(() => {
    if (fs.existsSync(testPath)) {
      rimraf.sync(testPath);
    }
  });

  describe('Generate component tests', () => {
    const resource = resources.get(ResourceType.Component);
    const resourceNames = resource.files.map(r => r.name(config));

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-component'),
      fileName: 'my-component',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    afterEach(() => {
      if (fs.existsSync(myPath.fullPath)) {
        rimraf.sync(myPath.fullPath);
      }
    });

    it('Should generate component default', async () => {
      const checkForSome = arr => string => arr.some(bit => string.endsWith(bit));
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Component, location, config);
      const files = fs.readdirSync(myPath.fullPath);

      expect(files).to.have.length(resource.files.length, `Incorect number of ${ResourceType.Component} files has been generated`);

      files.forEach((file) => {
        expect(file).to.satisfy(checkForSome(resourceNames), `Unknown ${file} was generated`);
      });
    });

    it('Should generate component without spec', async () => {
      config.defaults.component.spec = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      expect(files).to.have.length(resource.files.length - 1, `Incorect number of ${ResourceType.Component} files has been generated`);
    });

    it('Should generate component without style', async () => {
      config.defaults.component.inlineStyle = true;
      const location = Object.assign({}, myPath);
      const checkNoStyleFile = arr => arr.every(item => !item.endsWith(`.${config.defaults.styleExt}`));

      const result = await angularCli.generateResources(ResourceType.Component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      expect(files).to.satisfy(checkNoStyleFile, `Style file should not be created`);
    });

    it('Should generate component without template', async () => {
      config.defaults.component.inlineTemplate = true;
      const location = Object.assign({}, myPath);
      const checkNoTemlateFile = arr => arr.every(item => !item.endsWith('.html'));

      const result = await angularCli.generateResources(ResourceType.Component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      expect(files).to.satisfy(checkNoTemlateFile, `Template file should not be created`);
    });

    it('Should generate flat component', async () => {
      config.defaults.component.flat = true;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Component, location, config);

      const files = fs.readdirSync(myPath.dirPath);
      expect(files).to.have.length(resource.files.length, `Incorect number of ${ResourceType.Component} files has been generated`);

      files.forEach((file) => {
        const filePath = path.join(myPath.dirPath, file);
        fs.unlinkSync(filePath);
      });
    });


    it('Should generate component with OnPush change detection', async () => {
      config.defaults.component.changeDetection = 'OnPush';
      const location = Object.assign({}, myPath);

      const result = await angularCli.generateResources(ResourceType.Component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      const componentFileName = files.find(f => f.endsWith('component.ts'));
      const fileContent = fs.readFileSync(path.join(location.fullPath, componentFileName), 'utf-8');
      expect(fileContent).to.contain(config.defaults.component.changeDetection, ' Invalid change detection stratefy generated');
    });

    it('Should generate component with None viewEncapsulation', async () => {
      config.defaults.component.viewEncapsulation = 'None';
      const location = Object.assign({}, myPath);

      const result = await angularCli.generateResources(ResourceType.Component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      const componentFileName = files.find(f => f.endsWith('component.ts'));
      const fileContent = fs.readFileSync(path.join(location.fullPath, componentFileName), 'utf-8');
      expect(fileContent).to.contain(`encapsulation: ViewEncapsulation.${config.defaults.component.viewEncapsulation}`, ' Invalid change detection stratefy generated');
    });

    it('Should generate component with module declaration', async () => {
      const moduleLocation = Object.assign({}, { fullPath: path.join(testPath, 'my-module'), fileName: 'my-module', dirName: '', dirPath: testPath, rootPath: __dirname, params: [] });
      config.defaults.component.module = 'my-module';
      const componentLocation = Object.assign({}, moduleLocation, { fullPath: path.join(testPath, 'my-module', 'my-component'), fileName: 'my-component', dirPath: path.join(testPath, 'my-module') });
      await angularCli.generateResources(ResourceType.Module, moduleLocation, config);
      const result = await angularCli.generateResources(ResourceType.Component, componentLocation, config);
      const moduleFilename = fs.readdirSync(moduleLocation.fullPath).find(f => f.endsWith('module.ts'));

      expect(moduleFilename).not.to.be.empty;

      const moduleFileContent = fs.readFileSync(path.join(moduleLocation.fullPath, moduleFilename), 'utf-8');
      expect(moduleFileContent).to.contain('MyComponentComponent', 'No declaration has been added');
    });

    it('Should generate component with valid module declaration', async () => {
      // tslint:disable-next-line:max-line-length
      const beforeModuleContent = `import { BrowserModule } from \'@angular/platform-browser\';\nimport { NgModule } from \'@angular/core\';\nimport { RouterModule, Routes } from \'@angular/router\';\n\nimport { AppComponent } from \'./app.component\';\nimport { AdminSettingsComponent } from \'./admin-settings/admin-settings.component\';\nimport { AdminLandingComponent } from \'./admin-landing/admin-landing.component\';\nimport { AdminSettingsGradeMarksComponent } from \'./admin-settings-grade-marks/admin-settings-grade-marks.component\';\n\nconst appRoutes: Routes = [\n  { path: \'settings/main\', component: AdminSettingsComponent },\n  { path: \'settings/grade-marks\', component: AdminSettingsGradeMarksComponent },\n  { path: \'\', component: AdminLandingComponent }\n];\n\n@NgModule({\n   declarations: [\n      AppComponent,\n      AdminSettingsComponent,\n      AdminLandingComponent,\n      AdminSettingsGradeMarksComponent\n   ],\n   imports: [\n      RouterModule.forRoot(appRoutes),\n      BrowserModule\n   ],\n   providers: [\n      RouterModule\n   ],\n   bootstrap: [\n      AppComponent\n   ]\n})\nexport class AppModule {}\n`;
      // tslint:disable-next-line:max-line-length
      const afterModuleContent = "import { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { RouterModule, Routes } from '@angular/router';\n\nimport { AppComponent } from './app.component';\nimport { AdminSettingsComponent } from './admin-settings/admin-settings.component';\nimport { AdminLandingComponent } from './admin-landing/admin-landing.component';\nimport { AdminSettingsGradeMarksComponent } from './admin-settings-grade-marks/admin-settings-grade-marks.component';\nimport { JeffTestComponent } from './JeffTest/JeffTest.component';\n\nconst appRoutes: Routes = [\n  { path: 'settings/main', component: AdminSettingsComponent },\n  { path: 'settings/grade-marks', component: AdminSettingsGradeMarksComponent },\n  { path: '', component: AdminLandingComponent }\n];\n\n@NgModule({\n   declarations: [\t\n      AppComponent,\n      AdminSettingsComponent,\n      AdminLandingComponent,\n      AdminSettingsGradeMarksComponent,\n      JeffTestComponent\n   ],\n   imports: [\n      RouterModule.forRoot(appRoutes),\n      BrowserModule\n   ],\n   providers: [\n      RouterModule\n   ],\n   bootstrap: [\n      AppComponent\n   ]\n})\nexport class AppModule {}\n";
      const moduleLocation = Object.assign({}, { fullPath: path.join(testPath, 'my-module'), fileName: 'my-module', dirName: '', dirPath: testPath, rootPath: __dirname, params: [] });
      config.defaults.component.module = 'my-module';
      await angularCli.generateResources(ResourceType.Module, moduleLocation, config);
      const moduleFilename = fs.readdirSync(moduleLocation.fullPath).find(f => f.endsWith('module.ts'));

      expect(moduleFilename).not.to.be.empty;

      //  write test module content
      fs.writeFileSync(path.join(moduleLocation.fullPath, moduleFilename), beforeModuleContent,'utf-8');

      const componentLocation = Object.assign({}, moduleLocation, { fullPath: path.join(testPath, 'my-module', 'JeffTest'), fileName: 'JeffTest', dirPath: path.join(testPath, 'my-module') });
      const result = await angularCli.generateResources(ResourceType.Component, componentLocation, config);
   
      const realModuleFileContent = fs.readFileSync(path.join(moduleLocation.fullPath, moduleFilename), 'utf-8');

      expect(realModuleFileContent).to.be.eql(afterModuleContent);
    });
  });

  describe('Generate class tests', () => {
    const resource = resources.get(ResourceType.Class);

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-class'),
      fileName: 'my-class',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate class default', async () => {
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Class, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.endsWith(`${myPath.fileName}.ts`));

      expect(files).to.have.length(1, `Incorect number of ${ResourceType.Class} files has been generated`);
    });

    it('Should generate class with spec', async () => {
      config.defaults.class.spec = true;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Class, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Class} files has been generated`);
    });
  });

  describe('Generate directive tests', () => {
    const resource = resources.get(ResourceType.Directive);

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-directive'),
      fileName: 'my-directive',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate directive default', async () => {
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Directive, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Directive}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Directive} files has been generated`);
    });

    it('Should generate directive non flat', async () => {
      config.defaults.directive.flat = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Directive, location, config);
      const files = fs.readdirSync(myPath.fullPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Directive}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Directive} files has been generated`);
    });

    it('Should generate directive without spec', async () => {
      config.defaults.directive.flat = false;
      config.defaults.directive.spec = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Directive, location, config);
      const files = fs.readdirSync(myPath.fullPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Directive}`));

      expect(files).to.have.length(1, `Incorect number of ${ResourceType.Directive} files has been generated`);
    });
  });

  describe.skip('Generate guard tests', () => {
    const resource = resources.get(ResourceType.Guard);

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-guard'),
      fileName: 'my-guard',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate guard default', async () => {
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Guard, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Guard}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Guard} files has been generated`);
    });
  });

  describe('Generate interface tests', () => {
    const resource = resources.get(ResourceType.Interface);

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-interface'),
      fileName: 'my-interface',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate interface default', async () => {
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Interface, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.`));

      expect(files).to.have.length(1, `Incorect number of ${ResourceType.Interface} files has been generated`);
    });

    it('Should generate interface with prefix', async () => {
      config.defaults.interface.prefix = 'I';
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Interface, location, config);
      const interfaceFileName = fs.readdirSync(myPath.dirPath).find(f => f.includes(`${myPath.fileName}.`));
      const fileContent = fs.readFileSync(path.join(location.dirPath, interfaceFileName), 'utf-8');

      expect(fileContent).to.include('interface IMyInterface', `Incorect ${ResourceType.Interface} name has been generated`);
    });
  });

  describe('Generate module tests', () => {
    const resource = resources.get(ResourceType.Module);
    const resourceNames = resource.files.map(r => r.name(config));

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-module'),
      fileName: 'my-module',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate module default', async () => {
      const checkForSome = arr => string => arr.some(bit => string.endsWith(bit));
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Module, location, config);
      const files = fs.readdirSync(myPath.fullPath);

      expect(files).to.have.length(4, `Incorect number of ${ResourceType.Module} files has been generated`);
    });

    it('Should generate module with spec', async () => {
      config.defaults.module.spec = true;
      const checkForSome = arr => string => arr.some(bit => string.endsWith(bit));
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Module, location, config);
      const files = fs.readdirSync(myPath.fullPath);

      expect(files).to.have.length(5, `Incorect number of ${ResourceType.Module} files has been generated`);
    });

    it('Should generate module flat', async () => {
      config.defaults.module.flat = true;
      const checkForSome = arr => string => arr.some(bit => string.endsWith(bit));
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Module, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.`));

      expect(files).to.have.length(4, `Incorect number of ${ResourceType.Module} files has been generated`);
    });
  });

  describe('Generate pipe tests', () => {
    const resource = resources.get(ResourceType.Pipe);

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-pipe'),
      fileName: 'my-pipe',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate pipe default', async () => {
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Pipe, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Pipe}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Pipe} files has been generated`);
    });

    it('Should generate pipe non flat', async () => {
      config.defaults.pipe.flat = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Pipe, location, config);
      const files = fs.readdirSync(myPath.fullPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Pipe}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Pipe} files has been generated`);
    });

    it('Should generate pipe without spec', async () => {
      config.defaults.pipe.flat = false;
      config.defaults.pipe.spec = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Pipe, location, config);
      const files = fs.readdirSync(myPath.fullPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Pipe}`));

      expect(files).to.have.length(1, `Incorect number of ${ResourceType.Pipe} files has been generated`);
    });
  });

  describe('Generate service tests', () => {
    const resource = resources.get(ResourceType.Service);

    const myPath: IPath = {
      fullPath: path.join(testPath, 'my-service'),
      fileName: 'my-service',
      dirName: '',
      dirPath: testPath,
      rootPath: __dirname,
      params: [],
    };

    it('Should generate service default', async () => {
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Service, location, config);
      const files = fs.readdirSync(myPath.dirPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Service}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Service} files has been generated`);
    });

    it('Should generate service non flat', async () => {
      config.defaults.service.flat = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Service, location, config);
      const files = fs.readdirSync(myPath.fullPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Service}`));

      expect(files).to.have.length(2, `Incorect number of ${ResourceType.Service} files has been generated`);
    });

    it('Should generate service without spec', async () => {
      config.defaults.service.flat = false;
      config.defaults.service.spec = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(ResourceType.Service, location, config);
      const files = fs.readdirSync(myPath.fullPath).filter(f => f.includes(`${myPath.fileName}.${ResourceType.Service}`));

      expect(files).to.have.length(1, `Incorect number of ${ResourceType.Service} files has been generated`);
    });

  });

  it('Should contain only lowercase imports', async () => {
    const srcpath = path.resolve(__dirname, '..', 'src');

    const regex = /\(\s*([^)]+?)\s*\)/;
    const getAllFiles = dir =>
      fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
      },                         []);

    const files = getAllFiles(srcpath).filter(f => f.endsWith('.js'));
    files.forEach((file) => {
      const fileContent = fs.readFileSync(file, 'utf-8');
      const lines = fileContent.split('\r\n').filter(f => f.includes('require(') && !f.includes('__esModule'));
      const requireLines = lines.map(line => regex.exec(line)[1]);
      requireLines.forEach((line) => {
        expect(line).to.be.eql(line.toLocaleLowerCase());
      });
    });
  });

  it('Should contain templates', async () => {
    const srcPath = path.resolve(__dirname, '..', 'src', 'templates');
    expect(fs.existsSync(srcPath), `Templates folder doesn't exists`);
    const files = fs.readdirSync(srcPath).filter(f => f.endsWith('.tmpl'));
    expect(files).not.to.be.empty;
  });

});
