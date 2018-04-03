import { TemplateType } from './../enums/template-type';
export interface IResourceFile {
  name: Function;
  type: TemplateType;
  condition?: Function;
}
