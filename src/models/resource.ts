import { IResourceFile } from './resource-file';

export interface IResource {
  locDirName?: Function;
  locDirPath?: Function;
  files: IResourceFile[];
  createFolder?: Function;
  declaration?: string;
}
