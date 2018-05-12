import { IConfig } from './../models/config';

export const config: IConfig = {
  apps: [{
    root: 'src',
    prefix: 'app',
  }],
  defaults: {
    styleExt: 'css',
    component: {
      spec: true,
      inlineStyle: false,
      inlineTemplate: false,
      flat: false,
      changeDetection: 'Default',
      viewEncapsulation: 'Emulated',
      styleext: null,
      prefix: null,
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
