import cliOptionsParse from './cli-options.js';
import options from '../config.json';

let cliOptions = cliOptionsParse(process.argv);
Object.assign(options, cliOptions);
global.options = options;
export default options;
