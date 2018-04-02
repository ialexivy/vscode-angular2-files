import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mocha from 'mocha';
import * as path from 'path';
import AngularCli from './../src/Angular-Cli';
import { IConfig } from './../src/models/config';
import { IPath } from './../src/models/path';
import { config as defaultConfig } from './../src/config/cli-config';
import { resources } from './../src/resources';

chai.use(sinonChai);

const expect = chai.expect;
let config: IConfig = JSON.parse(JSON.stringify(defaultConfig));
const testPath = path.join(__dirname, 'app');
const angularCli = new AngularCli();

describe('Extension Tests:', () => {
  before(() => {
    if (!fs.existsSync(testPath)) {
      fs.mkdirSync(testPath);
    }
  });

  beforeEach(() => {
    config = JSON.parse(JSON.stringify(defaultConfig));
  });

  describe.only('Generate component tests', () => {
    const component = 'component';
    const resource = resources[component];
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
      const result = await angularCli.generateResources(component, location, config);
      const files = fs.readdirSync(myPath.fullPath);

      expect(files).to.have.length(resource.files.length, `Incorect number of ${component} files has been generated`);

      files.forEach((file) => {
        expect(file).to.satisfy(checkForSome(resourceNames), `Unknown ${file} was generated`);
      });
    });

    it('Should generate component without spec', async () => {
      config.defaults.component.spec = false;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      expect(files).to.have.length(resource.files.length - 1, `Incorect number of ${component} files has been generated`);
    });

    it('Should generate component without style', async () => {
      config.defaults.component.inlineStyle = true;
      const location = Object.assign({}, myPath);
      const checkNoStyleFile = arr => arr.every(item => !item.endsWith(`.${config.defaults.styleExt}`));

      const result = await angularCli.generateResources(component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      expect(files).to.satisfy(checkNoStyleFile, `Style file should not be created`);
    });

    it('Should generate component without template', async () => {
      config.defaults.component.inlineTemplate = true;
      const location = Object.assign({}, myPath);
      const checkNoTemlateFile = arr => arr.every(item => !item.endsWith('.html'));

      const result = await angularCli.generateResources(component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      expect(files).to.satisfy(checkNoTemlateFile, `Template file should not be created`);
    });

    it('Should generate flat component', async () => {
      config.defaults.component.flat = true;
      const location = Object.assign({}, myPath);
      const result = await angularCli.generateResources(component, location, config);

      const files = fs.readdirSync(myPath.dirPath);
      expect(files).to.have.length(resource.files.length, `Incorect number of ${component} files has been generated`);

      files.forEach((file) => {
        const filePath = path.join(myPath.dirPath, file);
        fs.unlinkSync(filePath);
      });
    });


    it('Should generate component with OnPush change detection', async () => {
      config.defaults.component.changeDetection = 'OnPush';
      const location = Object.assign({}, myPath);

      const result = await angularCli.generateResources(component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      const componentFileName = files.find(f => f.endsWith('component.ts'));
      const fileContent = fs.readFileSync(path.join(location.fullPath, componentFileName), 'utf-8');
      expect(fileContent).to.contain(config.defaults.component.changeDetection, ' Invalid change detection stratefy generated');
    });

    it('Should generate component with None viewEncapsulation', async () => {
      config.defaults.component.viewEncapsulation = 'None';
      const location = Object.assign({}, myPath);

      const result = await angularCli.generateResources(component, location, config);

      const files = fs.readdirSync(myPath.fullPath);
      const componentFileName = files.find(f => f.endsWith('component.ts'));
      const fileContent = fs.readFileSync(path.join(location.fullPath, componentFileName), 'utf-8');
      expect(fileContent).to.contain(`encapsulation: ViewEncapsulation.${config.defaults.component.viewEncapsulation}`, ' Invalid change detection stratefy generated');
    });
  });

  after(() => {
    if (fs.existsSync(testPath)) {
      rimraf.sync(testPath);
    }
  });
});
