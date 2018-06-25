import { OptionType } from '../enums/option-type';

export interface IPath {
  fileName: string;
  dirName: string;
  dirPath: string;
  fullPath: string;
  rootPath: string;
  params: OptionType[];
}
