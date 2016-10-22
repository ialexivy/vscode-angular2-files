export class FileContentsExtended {

    private camelCase (input: string): string {
        return input.replace( /-([a-z])/ig, function( all, letter ) {
            return letter.toUpperCase();
        });
    }

    public componentContent(inputName: string): string {
        var inputUpperCase: string;       
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        
        var componentContent: string = "import { Component, OnInit } from '@angular/core';\n\n" +
            "import { " + inputUpperCase + " } from './shared/" + inputName + ".model';\n" +
            "import { " + inputUpperCase + "Service } from './shared/" + inputName + ".service';\n" +
            "\n" +
            "@Component({\n" +
            "\tselector: '" + inputName + "',\n" +
            "\ttemplateUrl: '" + inputName + ".component.html',\n" +
            "\tproviders: [" + inputUpperCase + "Service]\n" +
            "})\n" +
            "\n" +
            "export class " + inputUpperCase + "Component implements OnInit {\n" +
            "\t"+ this.camelCase(inputName) +": "+ inputUpperCase +"[] = [];\n" +
            "\n" +
            "\tconstructor(private " + this.camelCase(inputName) + "Service: " + inputUpperCase + "Service) { }\n" +
            "\n" +
            "\tngOnInit() {\n" +
            "\t\tthis."+ this.camelCase(inputName) + "Service.getList().subscribe((res) => {\n" +
            "\t\t\tthis."+ this.camelCase(inputName) +" = res;\n" +
            "\t\t});\n" +
            "\t}\n" +
            "}";
        return componentContent;
    }

    public serviceContent(inputName: string): string {
        var inputUpperCase: string; 
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        var serviceContent: string = "import { Injectable } from '@angular/core';\n" +
            "import { Http } from '@angular/http';\n" +
            "import { Observable } from 'rxjs/Observable';\n" +
            "import 'rxjs/add/operator/map';\n" +
            "\n" +
            "import { "+ inputUpperCase +" } from './"+ inputName +".model';\n" +
            "\n" +
            "@Injectable()\n" +
            "export class " + inputUpperCase + "Service {\n" +
            "\n" +
            "\tconstructor(private http: Http) { }\n" +
            "\n" +
            "\tgetList(): Observable<"+ inputUpperCase +"[]> {\n" +
            "\t\treturn this.http.get('/api/list').map(res => res.json() as "+ inputUpperCase +"[]);\n" +
            "\t}\n" +
            "}";
        return serviceContent;
    }

    public modelContent(inputName: string): string {
        var inputUpperCase: string; 
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        var modelContent: string = "export class "+ inputUpperCase +" {\n" +
            "\tid: number;\n" +
            "\tname: string;\n" +
            "}";
        return modelContent;
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
        
        var specContent: string = "import { TestBed, inject } from '@angular/core/testing';\n" +
            "import { HttpModule } from '@angular/http';\n" +
            "import { Observable } from 'rxjs/Observable';\n" +
            "import 'rxjs/Rx';\n\n" +
            "import { " + inputUpperCase + "Component } from './" + inputName + ".component';\n" +
            "import { " + inputUpperCase + "Service } from './shared/" + inputName + ".service';\n" +
            "import { " + inputUpperCase + " } from './shared/" + inputName + ".model';\n" +
            "\n" +
            "describe('a "+ inputName +" component', () => {\n" +
                "\tlet component: " + inputUpperCase + "Component;\n" +
                "\n" +
                "\t// register all needed dependencies\n" +
                "\tbeforeEach(() => {\n" +
                    "\t\tTestBed.configureTestingModule({\n" +
                        "\t\t\timports: [HttpModule],\n" +
                        "\t\t\tproviders: [\n" +
                            "\t\t\t\t{ provide: " + inputUpperCase + "Service, useClass: Mock" + inputUpperCase + "Service },\n" +
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
            "});\n" +
            "\n" +
            "// Mock of the original " + inputName + " service\n" +
            "class Mock" + inputUpperCase + "Service extends " + inputUpperCase + "Service {\n" +
                "\tgetList(): Observable<any> {\n" +
                    "\t\treturn Observable.from([ { id: 1, name: 'One'}, { id: 2, name: 'Two'} ]);\n" +
                "\t}\n" +
            "}\n";
        return specContent;
    }

}