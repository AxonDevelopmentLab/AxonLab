const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path')
const cors = require("cors");

const app = express();

app.use(express.json(), express.urlencoded({ extended: true }), compression(), bodyParser.json(), cors());
app.use(express.static(path.join(__dirname, 'web')));

const routes = [
  { url: '/status', type: "file", content: "status.html"},
  { url: '/discord', type: "file", content: "discord.html" },
  { url: '/vinculate-discord', type: "file", content: "vinculate_discord.html" },
  { url: '/services', type: "file", content: "services.html" },
  { url: '/services/instalockapp', type: "file", content: "app_instalock.html" },
  { url: '/services/axsc', type: "file", content: "app_axsc.html" },
  { url: '/support', type: "file", content: "support.html" },
  { url: '/account', type: "file", content: "login.html" },
  { url: '/popupauth', type: "file", content: "popupauth.html" },
  { url: '/account/dashboard', type: "file", content: "dashboard.html" },
  { url: '/account/invalid_token', type: "function", content: (req, res) => { return res.send(`<body onload="location.href='${req.protocol + '://' + req.get('host')}/account'"></body>`)}},
  { url: '/account/verified', type: "function", content: (req, res) => { return res.send(`<body onload="location.href='${req.protocol + '://' + req.get('host')}/account'"></body>`)}},
  { url: '/account/verify', type: "function", content: (req, res) => {
    if (req.query.token) return res.send(`<body onload="location.href='https://axon-services.glitch.me/email_verification?token=${req.query.token}'"></body>`);
    return res.send(`<body onload="window.close()"></body>`);
  }}
];

routes.forEach(route => {
    app.get(route.url, (req, res) => {
      if (req.url.endsWith('/')) return res.send(`<body onload="location.href='${req.protocol + '://' + req.get('host') + req.url.substring(0, req.url.length - 1)}'"></body>`)
      if (route.type === "file") res.sendFile(path.join(__dirname, 'web', route.content));
      if (route.type === "send") res.send(route.content);
      if (route.type === "function") route.content(req, res);
    });
});

const server = app.listen(8080, () => { console.log('[AxonLAB] Service is running.')});
const webchat = require("./webchat.js");
webchat.load(server);