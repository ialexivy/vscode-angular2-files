import { IConfig } from './config';
export class FileContents {

  private camelCase(input: string): string {
    return input.replace(/-([a-z])/ig, function (all, letter) {
      return letter.toUpperCase();
    });
  }

  public componentSCSSContent(inputName: string): string {
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    var componentContent: string = ``;
    return componentContent;
  }

  public componentCSSContent(inputName: string): string {
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    var componentContent: string = ``;
    return componentContent;
  }

  public componentHTMLContent(inputName: string): string {
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    var componentContent: string = `<p>
  ${inputName} works!
</p>`;
    return componentContent;
  }


  public componentContent(inputName: string, config: IConfig): string {
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    var componentContent: string = `import { Component, OnInit } from '@angular/core';

@Component({
  selector: '${config.prefix}-${inputName}',
  templateUrl: './${inputName}.component.html',
  styleUrls: ['./${inputName}.component.css']
})
export class ${inputUpperCase}Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}`;
    return componentContent;
  }

  public componentTestContent(inputName: string): string {
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    var componentContent: string = `/* tslint:disable:no-unused-variable */
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
});`;
    return componentContent;
  }

  public moduleContent(inputName: string): string {
    let upperName = this.toUpperCase(inputName);

    var componentContent: string = `import { NgModule } from '@angular/core';
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
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    let content: string = `import { Injectable } from '@angular/core';

@Injectable()
export class ${inputUpperCase}Service {

constructor() { }

}`;
    return content;
  }

  public serviceTestContent(inputName: string): string {
    var inputUpperCase: string;
    inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    let content: string = `/* tslint:disable:no-unused-variable */

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
    let upperName = this.toUpperCase(inputName);

    var content: string = `import { Directive } from '@angular/core';

@Directive({
  selector: '[${config.prefix}${upperName}]'
})
export class ${upperName}Directive {

  constructor() { }

}`;
    return content;
  }

  public directiveTestContent(inputName: string): string {
    let upperName = this.toUpperCase(inputName);

    var content: string = `/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { ${upperName}Directive } from './${inputName}.directive';

describe('Directive: ${upperName}', () => {
  it('should create an instance', () => {
    let directive = new ${upperName}Directive();
    expect(directive).toBeTruthy();
  });
});`;
    return content;
  }


  public pipeContent(inputName: string): string {
    let upperName = this.toUpperCase(inputName);

    var content: string = `import { Pipe, PipeTransform } from '@angular/core';

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
    let upperName = this.toUpperCase(inputName);

    var content: string = `/* tslint:disable:no-unused-variable */

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
    let upperName = this.toUpperCase(inputName);

    var content: string = `export class ${upperName} {
}`;
    return content;
  }

  public interfaceContent(inputName: string): string {
    let upperName = this.toUpperCase(inputName);

    var content: string = `export interface ${upperName} {
}`;
    return content;
  }

  public enumContent(inputName: string): string {
    let upperName = this.toUpperCase(inputName);

    var content: string = `export enum ${upperName} {
}`;
    return content;
  }

  private toUpperCase(input: string): string {
    let inputUpperCase: string;
    inputUpperCase = input.charAt(0).toUpperCase() + input.slice(1);
    inputUpperCase = this.camelCase(inputUpperCase);

    return inputUpperCase;
  }
}