import { ResourceType } from './enums/resource-type';
import { ICommand } from './models/command';
import { CommandType } from './enums/command-type';

export const commandsMap = new Map<CommandType, ICommand>([
  [CommandType.Component, { fileName: 'my-component', resource: ResourceType.Component }],
  [CommandType.Directive, { fileName: 'my-directive', resource: ResourceType.Directive }],
  [CommandType.Pipe, { fileName: 'my-pipe', resource: ResourceType.Pipe }],
  [CommandType.Service, { fileName: 'my-service', resource: ResourceType.Service }],
  [CommandType.Class, { fileName: 'my-class', resource: ResourceType.Class }],
  [CommandType.Interface, { fileName: 'my-interface', resource: ResourceType.Interface }],
  [CommandType.Route, { fileName: 'my-route', resource: ResourceType.Route }],
  [CommandType.Enum, { fileName: 'my-enum', resource: ResourceType.Enum }],
  [CommandType.Module, { fileName: 'my-module', resource: ResourceType.Module }],
]);
