import { IResourceFile } from './resource-file';
import { OptionType } from '../enums/option-type';

export interface IResource {
  locDirName?: Function;
  locDirPath?: Function;
  files: IResourceFile[];
  createFolder?: Function;
  declaration?: string;
  options?: OptionType[];
}
