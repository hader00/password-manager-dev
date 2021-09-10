const WebSocket = require('ws');

class ExtensionController {
    constructor(controller) {
        this.controller = controller
        this.server = new WebSocket.Server({
            port: 3002
        });
        this.sockets = [];
        //
        this.init();
    }

    init() {
        let that = this;
        this.server.on('connection', function (socket) {
            that.sockets.push(socket);
            //
            socket.on('message', async function (msg) {
                console.log("message")
                let message = JSON.parse(msg)
                let response = {}
                //
                switch (message.channel) {
                    case "defaultView:get":
                        const defaultView = that.controller.getDefaultView()
                        response = {channel: 'defaultView:response', defaultView: defaultView}
                        break;
                    case "password:decrypt":
                        const decryptedPassword = await that.controller.decryptPassword(message.password)
                        response = {channel: 'password:decryptResponse', password: decryptedPassword}
                        break;
                    case "password:generate":
                        const generatedPassword = that.controller.generatePassword(message.length, message.specialCharacters, message.numbers, message.lowerCase, message.upperCase)
                        response = {channel: 'password:generateResponse', password: generatedPassword}
                        break;
                    case "selectDatabase:get":
                        const selectedFile = await that.controller.selectDatabase();
                        response = {channel: 'selectDatabase:response', selectedFile: selectedFile}
                        break;
                    case "selectFolder:get":
                        const selectedFolder = await that.controller.selectFolder();
                        response = {channel: 'selectFolder:response', selectedFolder: selectedFolder}
                        break;
                    case "localLogin:login":
                        const localLoginSuccess = that.controller.localLogin(message.password, message.location);
                        response = {channel: 'localLogin:response', localLoginSuccess: localLoginSuccess}
                        break;
                    case "localLogin:register":
                        const localRegistrationSuccess = that.controller.localRegistration(message.password, message.location);
                        response = {
                            channel: 'localLogin:registerResponse',
                            localRegistrationSuccess: localRegistrationSuccess
                        }
                        break;
                    case "remoteLogin:login":
                        const remoteLoginSuccess = await that.controller.remoteLogin(message.server, message.email, message.password, message.saveEmail);
                        response = {channel: 'remoteLogin:response', remoteLoginSuccess: remoteLoginSuccess};
                        break;
                    case "email:get":
                        const email = await that.controller.getEmail();
                        response = {channel: 'email:response', email: email};
                        break;
                    case "remoteRegistration:register":
                        const remoteRegistrationSuccess = that.controller.remoteRegistration(message.server, message.email, message.password, message.confirmationPassword, message.firstName, message.lastName);
                        response = {
                            channel: 'remoteRegistration:response',
                            remoteRegistrationSuccess: remoteRegistrationSuccess
                        };
                        break;
                    case "passwords:add":
                        const addSuccess = that.controller.addPassword(message.Title, message.Description, message.Url, message.Username, message.Password);
                        response = {channel: 'passwords:addResponse', addSuccess: addSuccess};
                        break;
                    case "passwords:update":
                        const updateSuccess = that.controller.updatePassword(message.Id, message.Title, message.Description, message.Url, message.Username, message.Password);
                        response = {channel: 'passwords:updateResponse', updateSuccess: updateSuccess};
                        break;
                    case "passwords:delete":
                        const deleteSuccess = that.controller.deletePassword(message.Id);
                        response = {channel: 'passwords:deleteResponse', deleteSuccess: deleteSuccess};
                        break;
                    case "passwords:fetch":
                        const fetchedPasswords = await that.controller.fetchPasswords();
                        console.log(fetchedPasswords)
                        response = {channel: 'passwords:fetchResponse', response: fetchedPasswords};
                        break;
                    case "db:exists":
                        // todo needs to be handled other way by saving previous user state (custom location etc)
                        const dbExists = that.controller.dbExists();
                        response = {channel: 'db:response', dbExists: dbExists};
                    default:
                    // code block
                }
                console.log(response)
                that.sockets.forEach(s => s.send(JSON.stringify(response)));
            });
            //
            socket.on('close', function () {
                console.log("close")
                that.sockets = that.sockets.filter(s => s !== socket);
            });
        });
    }
}

module.exports = {ExtensionController};