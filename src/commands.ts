import { ResourceType } from './enums/resource-type';
import { ICommand } from './models/command';
import { CommandType } from './enums/command-type';

export const commandsMap = new Map<CommandType, ICommand>([
  [CommandType.Component, { fileName: 'my-component.component.ts', resource: ResourceType.Component }],
  [CommandType.Directive, { fileName: 'my-directive.directive.ts', resource: ResourceType.Directive }],
  [CommandType.Pipe, { fileName: 'my-pipe.pipe.ts', resource: ResourceType.Pipe }],
  [CommandType.Service, { fileName: 'my-service.service.ts', resource: ResourceType.Service }],
  [CommandType.Class, { fileName: 'my-class.class.ts', resource: ResourceType.Class }],
  [CommandType.Interface, { fileName: 'my-interface.interface.ts', resource: ResourceType.Interface }],
  [CommandType.Route, { fileName: 'my-route.routing.ts', resource: ResourceType.Route }],
  [CommandType.Enum, { fileName: 'my-enum.enum.ts', resource: ResourceType.Enum }],
  [CommandType.Module, { fileName: 'my-module.module.ts', resource: ResourceType.Module }],
]);
