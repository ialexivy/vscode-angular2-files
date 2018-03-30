import * as myExtension from '../src/extension';
import * as vscodeTestContent from 'vscode-test-content';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mocha from 'mocha';

chai.use(sinonChai);

const expect = chai.expect;
