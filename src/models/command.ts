import { ResourceType } from '../enums/resource-type';

export interface ICommand {
  fileName: string;
  resource: ResourceType;
}
