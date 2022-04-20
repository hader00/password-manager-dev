const {Controller} = require("./Controllers/Controller.js");
const {ElectronController} = require("./Controllers/ElectronController.js");
const {ExtensionController} = require("./Controllers/ExtensionController.js")
const {ElectronWindowBuilder} = require("./Controllers/ElectronWindowBuilder");

const controller = new Controller()
let win = new ElectronWindowBuilder(controller)
new ElectronController(controller, win);
new ExtensionController(controller);



