const WebSocket = require('ws');
const ChannelUtils = require("../src/Utils/ChannelUtils");
const PMUtils = require("../src/Utils/PMUtils");

/**
 * ExtensionController object that starts websocket for communication
 * with extension.
 *
 * The class also initialize listeners for websocket messaging
 *
 * @param  controller  a class providing application functionality
 */
class ExtensionController {
    constructor(controller) {
        this.controller = controller
        this.server = new WebSocket.Server({
            port: 3002
        });
        this.sockets = [];
        this.init();
    }

    init() {
        this.controller.setExtensionControllerLogout(this.logout)
        this.controller.setExtensionControllerLogin(this.login)
        this.controller.setTerminateWebsocket(this.close)
        let that = this;
        this.server.on('connection', function (socket) {
            that.sockets.push(socket);
            // Act on message from socket
            socket.on('message', async function (msg) {
                let message = JSON.parse(msg.toString());
                let response = {};
                //********* socket messaging ****//
                /* Keep channel names synchronised with ./ChannelUtils when changing */
                switch (message.channel) {
                    // Get stored default view and default logout time
                    case ChannelUtils.DEFAULT_VIEW_CALL:
                        const defaultView = that.controller.getDefaultView();
                        const {logoutTimeout} = that.controller.getStoredSecurity();
                        response = {
                            channel: ChannelUtils.DEFAULT_VIEW_RESPONSE,
                            defaultView: defaultView,
                            timeout: logoutTimeout
                        };
                        break;
                    // Decrypt password from currently viewed password item
                    case ChannelUtils.PASSWORD_DECRYPT_CALL:
                        const decryptedPassword = await that.controller.decryptPassword(message.password);
                        response = {channel: ChannelUtils.PASSWORD_DECRYPT_RESPONSE, password: decryptedPassword};
                        break;
                    // Generate new password with custom options
                    case ChannelUtils.PASSWORD_GENERATE_CALL:
                        const generatedPassword = await that.controller.generatePassword(message.length, message.specialCharacters, message.numbers, message.lowerCase, message.upperCase);
                        response = {channel: ChannelUtils.PASSWORD_GENERATE_RESPONSE, password: generatedPassword};
                        break;
                    // Add password item to database
                    case ChannelUtils.PASSWORD_ADD_CALL:
                        const addSuccess = await that.controller.addPassword(message.title, message.description, message.url, message.username, message.password);
                        response = {channel: ChannelUtils.PASSWORD_ADD_RESPONSE, addSuccess: addSuccess};
                        break;
                    // Update password item in database
                    case ChannelUtils.PASSWORD_UPDATE_CALL:
                        const updateSuccess = await that.controller.updatePassword(message.id, message.title, message.description, message.url, message.username, message.password);
                        response = {channel: ChannelUtils.PASSWORD_UPDATE_RESPONSE, updateSuccess: updateSuccess};
                        break;
                    // Delete password item from database
                    case ChannelUtils.PASSWORD_DELETE_CALL:
                        const deleteSuccess = await that.controller.deletePassword(message.id);
                        response = {channel: ChannelUtils.PASSWORD_DELETE_RESPONSE, deleteSuccess: deleteSuccess};
                        break;
                    // Get all passwords items from database
                    case ChannelUtils.PASSWORD_FETCH_CALL:
                        const fetchedPasswords = await that.controller.fetchPasswords();
                        response = {channel: ChannelUtils.PASSWORD_FETCH_RESPONSE, response: fetchedPasswords};
                        break;
                    // Get default logout and clipboard timeouts
                    case ChannelUtils.SECURITY_CALL:
                        const timeouts = that.controller.getStoredSecurity();
                        response = {channel: ChannelUtils.SECURITY_RESPONSE, response: timeouts};
                        break;
                    // Logout and clear users data
                    case ChannelUtils.LOGOUT_CALL:
                        that.controller.logoutImmediate();
                        break;
                    default:
                        break;
                }
                that.sockets.forEach(s => s.send(JSON.stringify(response)));
            });
            //
            socket.on('close', function () {
                that.sockets = that.sockets.filter(s => s !== socket);
            });
        });
    }

    logout = () => {
        if (this.sockets !== null) {
            this.sockets.forEach(s => s.send(JSON.stringify({channel: ChannelUtils.LOGOUT_CALL})));
        }
    }

    login = () => {
        if (this.sockets !== null) {
            const {logoutTimeout} = this.controller.getStoredSecurity();
            this.sockets.forEach(s => s.send(JSON.stringify({
                channel: ChannelUtils.DEFAULT_VIEW_RESPONSE,
                defaultView: PMUtils.VIEW_TYPE.passwordListView,
                timeout: logoutTimeout
            })));
        }
    }

    close = () => {
        try {
            this.logout()
            if (this.server !== null) {
                this.server.close();
            }
        } catch (e) {
            if (this.server !== null) {
                this.server.terminate();
            }
        }
    }
}

module.exports = {ExtensionController};