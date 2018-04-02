import * as path from 'path';
import { TemplateType } from './template-type';

export const resources = {
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
