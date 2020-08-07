import { IConfig } from './../models/config';

export const config: IConfig = {
  version: 'ng5',
  apps: [{
    root: 'src',
    prefix: 'app',
  }],
  defaults: {
    styleExt: 'css',
    style: 'css',
    component: {
      spec: true,
      inlineStyle: false,
      inlineTemplate: false,
      flat: false,
      changeDetection: 'Default',
      viewEncapsulation: 'Emulated',
      styleext: null,
      style: null,
      prefix: null,
      skipImport: false,
      module: 'app',
    },
    class: {
      spec: false,
    },
    directive: {
      flat: true,
      spec: true,
      prefix: null,
    },
    guard: {
      flat: true,
      spec: true,
    },
    interface: {
      prefix: '',
    },
    module: {
      flat: false,
      spec: false,
      skipImport: false,
      routing: false,
      routingScope: 'Child',
      commonModule: true,
    },
    pipe: {
      flat: true,
      spec: true,
    },
    service: {
      flat: true,
      spec: true,
    },
  },
};
