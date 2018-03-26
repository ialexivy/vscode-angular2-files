import { IConfig } from './models/config';
import { toCamelCase } from './formatting';
export class FileContents {

  public componentSCSSContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const componentContent: string = ``;
    return componentContent;
  }

  public componentCSSContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const componentContent: string = ``;
    return componentContent;
  }

  public componentHTMLContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const componentContent: string = `<p>
  ${inputName} works!
</p>`;
    return componentContent;
  }

  public componentContent(inputName: string, config: IConfig): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const componentContent = `import { Component, OnInit${config.defaults.component.viewEncapsulation !== 'Emulated' ? ', ViewEncapsulation' : ''}${config.defaults.component.changeDetection !== 'Default' ? ', ChangeDetectionStrategy' : ''} } from '@angular/core';

@Component({
  selector: '${config.apps[0].prefix}-${inputName}',
  ${config.defaults.component.inlineTemplate ? `template: \`\n   <p>\n  \t\t${inputName} Works!\n   </p>\n  \`` : `templateUrl: './${inputName}.component.html'`},
  ${config.defaults.component.inlineStyle ? 'styles: []' : `styleUrls: ['./${inputName}.component.${config.defaults.styleExt}']`}${config.defaults.component.viewEncapsulation !== 'Emulated' ? `,\n  encapsulation: ViewEncapsulation.${config.defaults.component.viewEncapsulation}` : ''}${config.defaults.component.changeDetection !== 'Default' ? `,\n  changeDetection: ChangeDetectionStrategy.OnPush` : ''}
})
export class ${inputUpperCase}Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
`;
    return componentContent;
  }

  public componentTestContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const componentContent: string = `/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ${inputUpperCase}Component } from './${inputName}.component';

describe('${inputUpperCase}Component', () => {
  let component: ${inputUpperCase}Component;
  let fixture: ComponentFixture<${inputUpperCase}Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ${inputUpperCase}Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(${inputUpperCase}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`;
    return componentContent;
  }

  public moduleContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const componentContent: string = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${upperName}Component } from './${inputName}.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [${upperName}Component]
})
export class ${upperName}Module { }`;
    return componentContent;
  }

  public serviceContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const content: string = `import { Injectable } from '@angular/core';

@Injectable()
export class ${inputUpperCase}Service {

constructor() { }

}`;
    return content;
  }

  public serviceTestContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const content: string = `/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ${inputUpperCase}Service } from './${inputName}.service';

describe('Service: ${inputUpperCase}', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [${inputUpperCase}Service]
    });
  });

  it('should ...', inject([${inputUpperCase}Service], (service: ${inputUpperCase}Service) => {
    expect(service).toBeTruthy();
  }));
});`;
    return content;
  }


  public directiveContent(inputName: string, config: IConfig): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `import { Directive } from '@angular/core';

@Directive({
  selector: '[${config.apps[0].prefix}${upperName}]'
})
export class ${upperName}Directive {

  constructor() { }

}`;
    return content;
  }

  public directiveTestContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { ${upperName}Directive } from './${inputName}.directive';

describe('Directive: ${upperName}', () => {
  it('should create an instance', () => {
    const directive = new ${upperName}Directive();
    expect(directive).toBeTruthy();
  });
});`;
    return content;
  }


  public pipeContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '${inputName}'
})
export class ${upperName}Pipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}`;
    return content;
  }

  public pipeTestContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { ${upperName}Pipe } from './${inputName}.pipe';

describe('Pipe: ${upperName}e', () => {
  it('create an instance', () => {
    let pipe = new ${upperName}Pipe();
    expect(pipe).toBeTruthy();
  });
});`;
    return content;
  }

  public classContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `export class ${upperName} {
}
`;
    return content;
  }

  public classTestContent(inputName: string): string {
    let inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    const classContent: string = `import {${inputUpperCase}} from './${inputName}';

describe('${inputUpperCase}', () => {
  it('should create an instance', () => {
    expect(new ${inputUpperCase}()).toBeTruthy();
  });
});
`;
    return classContent;
  }

  public interfaceContent(inputName: string, config: IConfig): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `export interface ${config.defaults.interface.prefix}${upperName} {
}`;
    return content;
  }

  public routeContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {  },
];

export const ${upperName}Routes = RouterModule.forChild(routes);
`;
    return content;
  }

  public enumContent(inputName: string): string {
    const upperName = this.toUpperCase(inputName);

    const content: string = `export enum ${upperName} {
}`;
    return content;
  }

  private toUpperCase(input: string): string {
    let inputUpperCase: string;
    inputUpperCase = input.charAt(0).toUpperCase() + input.slice(1);
    inputUpperCase = toCamelCase(inputUpperCase);

    return inputUpperCase;
  }
}
