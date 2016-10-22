export class FileContents {

    private camelCase(input: string): string {
        return input.replace(/-([a-z])/ig, function (all, letter) {
            return letter.toUpperCase();
        });
    }

    public componentContent(inputName: string): string {
        var inputUpperCase: string;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);

        var componentContent: string = "import { Component, OnInit } from '@angular/core';\n" +
            "\n" +
            "@Component({\n" +
            "\tselector: '" + inputName + "',\n" +
            "\ttemplateUrl: '" + inputName + ".component.html'\n" +
            "})\n" +
            "\n" +
            "export class " + inputUpperCase + "Component implements OnInit {\n" +
            "\n" +
            "\tngOnInit() { }\n" +
            "}";
        return componentContent;
    }


    public serviceContent(inputName: string): string {
        var inputUpperCase: string;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);

        let serviceContent: string = `import { Injectable } from '@angular/core';

@Injectable()
export class ${inputUpperCase}Service {

constructor() { }

}`;
        return serviceContent;
    }

    public serviceTestContent(inputName: string): string {
        var inputUpperCase: string;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);

        let serviceTestContent: string = `/* tslint:disable:no-unused-variable */

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
        return serviceTestContent;
    }

    public templateContent(inputName: string): string {
        var inputUpperCase: string;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        var templateContent: string = `<div class="${inputName}"> Hello ${inputUpperCase}Component! </div>`;
        return templateContent;
    }

    public cssContent(inputName: string): string {
        var inputUpperCase: string = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        var cssContent: string = `.${inputName} {\n\n}`;
        return cssContent;
    }

    public specContent(inputName: string): string {
        var inputUpperCase: string;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);

        var specContent: string = "import { TestBed, inject } from '@angular/core/testing';\n\n" +
            "import { " + inputUpperCase + "Component } from './" + inputName + ".component';\n" +
            "\n" +
            "describe('a " + inputName + " component', () => {\n" +
            "\tlet component: " + inputUpperCase + "Component;\n" +
            "\n" +
            "\t// register all needed dependencies\n" +
            "\tbeforeEach(() => {\n" +
            "\t\tTestBed.configureTestingModule({\n" +
            "\t\t\tproviders: [\n" +
            "\t\t\t\t" + inputUpperCase + "Component\n" +
            "\t\t\t]\n" +
            "\t\t});\n" +
            "\t});\n" +
            "\n" +
            "\t// instantiation through framework injection\n" +
            "\tbeforeEach(inject([" + inputUpperCase + "Component], (" + inputUpperCase + "Component) => {\n" +
            "\t\tcomponent = " + inputUpperCase + "Component;\n" +
            "\t}));\n" +
            "\n" +
            "\tit('should have an instance', () => {\n" +
            "\t\texpect(component).toBeDefined();\n" +
            "\t});\n" +
            "});";
        return specContent;
    }

}