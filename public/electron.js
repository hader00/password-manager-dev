const {Controller} = require("./Controller.js");
const {ElectronController} = require("./ElectronController.js");
const {ExtensionController} = require("./ExtensionController.js")

const controller = new Controller()
const electronController = new ElectronController(controller);
const extensionController = new ExtensionController(controller);



