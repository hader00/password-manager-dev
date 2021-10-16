const {Controller} = require("./Controller.js");
const {ElectronController} = require("./ElectronController.js");
const {ExtensionController} = require("./ExtensionController.js")

const controller = new Controller()
new ElectronController(controller);
new ExtensionController(controller);



