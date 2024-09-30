const WebSocket = require('ws');
const crypto = require('crypto');

exports.load = (server) => {
    const wss = new WebSocket.Server({ server });

    let users = {};
    const supportToken = process.env.SupporterKey;
    let supportOnline = { status: 'false', token: undefined, ws: undefined };
    const cores_html = ['aquamarine', 'black', 'blue', 'blueviolet', 'brown', 'cadetblue', 'chocolate', 'coral', 'cornflowerblue', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick', 'forestgreen', 'fuchsia', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'indianred', 'indigo', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgreen', 'lightgray', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];
    setInterval(() => {
        if (Object.keys(users).length > 0) {
            for (const userToken of Object.keys(users)) {
                const getUser = users[userToken];
                const heartbeatToken = crypto.randomBytes(4).toString('hex');
                getUser.ws.send(JSON.stringify({ heartbeat: heartbeatToken }));

                setTimeout(() => {
                    const regetUser = users[userToken];
                    if (regetUser && regetUser.heartbeat !== heartbeatToken) {
                        delete users[userToken];
                        if (userToken === supportOnline.token) {
                            supportOnline = {
                                status: 'false',
                                token: undefined,
                                ws: undefined
                            };

                            for (const user of Object.keys(users)) users[user].ws.send(JSON.stringify({ status: supportOnline.status }))
                        };
                    }
                }, 2000);
            }
        }
    }, 10000)
    wss.on('connection', (ws) => {
        const userToken = crypto.randomBytes(3).toString('hex');
        users[userToken] = {
            color: cores_html[Math.floor(Math.random() * cores_html.length)],
            blocked: false,
            blocked_messages: 0,
            last_message: 0,
            heartbeat: '0',
            ws: ws
        }

        ws.send(JSON.stringify({ status: supportOnline.status }));
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());

                if (data.heartbeat) users[userToken].heartbeat = data.heartbeat
                if (data.message) {
                    if (data.message.startsWith('/')) {
                        const args = data.message.split(' ');
                        if (args[0] === '/support-mode') {
                            if (args[1] !== supportToken) return;
                            supportOnline = {
                                status: 'true',
                                token: userToken,
                                ws: ws
                            };

                            for (const user of Object.keys(users)) users[user].ws.send(JSON.stringify({ status: supportOnline.status }))
                            ws.send(JSON.stringify({ message: 'O modo supporter foi ativado com sucesso!', tags: [['SISTEMA', 'red']] }));
                        };

                        if (args[0] === '/comandos') {
                            ws.send(JSON.stringify({ message: 'Lista de comandos:<br>/support-mode (Chave)<br>/support-end<br>/r (Usuário) (Mensagem)<br>/block-user (Usuário)<br>/comandos', tags: [['SISTEMA', 'red']] }));
                        }

                        if (args[0] === '/support-end') {
                            if (userToken !== supportOnline.token) return;

                            supportOnline = {
                                status: 'false',
                                token: undefined,
                                ws: undefined
                            }

                            for (const user of Object.keys(users)) users[user].ws.send(JSON.stringify({ status: supportOnline.status }));
                        }

                        if (args[0] === '/r') {
                            if (userToken !== supportOnline.token) return;
                            const getToken = args[1];
                            if (!users[getToken]) {
                                ws.send(JSON.stringify({ message: 'Esse usuário não existe mais.', tags: [['SISTEMA', 'red']] }));
                                delete users[getToken];
                            }

                            const getContent = data.message.replaceAll(`/r ${getToken} `, '');
                            users[getToken].ws.send(JSON.stringify({ message: getContent, tags: [['SUPORTE', 'green']] }));
                            ws.send(JSON.stringify({ message: 'Mensagem enviada com sucesso.', tags: [['SISTEMA', 'red']] }));
                        }

                        if (args[0] === '/block-user') {
                            if (userToken !== supportOnline.token) return;
                            const getToken = args[1];
                            if (!users[getToken]) {
                                ws.send(JSON.stringify({ message: 'Esse usuário não existe mais.', tags: [['SISTEMA', 'red']] }));
                                delete users[getToken];
                            }

                            users[getToken].blocked = true;
                            ws.send(JSON.stringify({ message: 'O usuário foi bloqueado com sucesso.', tags: [['SISTEMA', 'red']] }));
                        }
                    } else {
                        if (data.message.length > 750) return ws.send(JSON.stringify({ message: 'Você não pode enviar mensagens longas.', tags: [['SISTEMA', 'red']] }));
                        if (users[userToken].blocked_messages > 5) return delete users[userToken];
                        if ((users[userToken].last_message + 1) > Math.round(Date.now() / 1000)) { users[userToken].blocked_messages++; return ws.send(JSON.stringify({ message: 'Aguarde para enviar mensagem novamente.', tags: [['SISTEMA', 'red']] })); };
                        users[userToken].blocked_messages = 0;
                        users[userToken].last_message = Math.round(Date.now() / 1000);
                        if (supportOnline.status === 'true' && users[userToken].blocked === false) {
                            supportOnline.ws.send(JSON.stringify({ message: data.message, notification: true, tags: [['USUÁRIO', 'white'], [userToken, users[userToken].color]] }))
                        }
                    }
                }
            } catch (err) {
                console.log(err)
                delete users[userToken];
            }
        });
    });
}