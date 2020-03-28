const io = require('socket.io-client');
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const auth = require('@feathersjs/authentication-client');
var jwtDecode = require('jwt-decode');
var lt = require('long-timeout')


module.exports = function(RED) {
    var reconnect = RED.settings.mysqlReconnectTime || 20000;
    function FeathersFindNode(n) {
        RED.nodes.createNode(this,n);
        //console.log(n);
        this.feathconf = n.feathconf;
        this.service = n.service;
        this.limit = n.limit;
        this.query = n.query;
        this.feathersConfig = RED.nodes.getNode(this.feathconf);

        if (this.feathersConfig) {
            this.feathersConfig.connect();
            var node = this;
            var busy = false;
            var status = {};
            node.feathersConfig.on("state", function (info) {
                if (info === "connecting") {
                    node.status({fill: "grey", shape: "ring", text: info});
                } else if (info === "connected") {
                    node.status({fill: "green", shape: "dot", text: info});
                } else {
                    if (info === "ECONNREFUSED") {
                        info = "connection refused";
                    }
                    if (info === "PROTOCOL_CONNECTION_LOST") {
                        info = "connection lost";
                    }
                    node.status({fill: "red", shape: "ring", text: info});
                }
            });

            this.on('input', function(msg) {
                var query,service,limit;
                    //console.log(node.feathersConfig.client);
                    query = msg.hasOwnProperty('query') ? msg.query : node.query;
                if (!query) {
                    query = {};
                    //node.error(RED._("influxdb.errors.noquery"), msg);
                    //return;
                }
                query['$limit'] = node.limit;
                service = msg.hasOwnProperty('service') ? msg.service : node.service;
                if (!service) {
                    //query = {};
                    node.error(RED._("service must be specified"), msg);
                    return;
                }
                    node.feathersConfig.client.service(service).find({query:query}).then((res)=>{
                        msg.payload = res.data;
                        node.send(msg);
                    }).catch((err)=>{
                        node.error(err);
                    })
                });


        }
        else{
            this.error("Feathers client not configured");
        }
    }
    RED.nodes.registerType("feathers-find",FeathersFindNode);

    function FeathersCreateNode(n) {
        RED.nodes.createNode(this,n);
        //console.log(n);
        this.feathconf = n.feathconf;
        this.service = n.service;
        this.feathersConfig = RED.nodes.getNode(this.feathconf);

        if (this.feathersConfig) {
            this.feathersConfig.connect();
            var node = this;
            var busy = false;
            var status = {};
            node.feathersConfig.on("state", function (info) {
                if (info === "connecting") {
                    node.status({fill: "grey", shape: "ring", text: info});
                } else if (info === "connected") {
                    node.status({fill: "green", shape: "dot", text: info});
                } else {
                    if (info === "ECONNREFUSED") {
                        info = "connection refused";
                    }
                    if (info === "PROTOCOL_CONNECTION_LOST") {
                        info = "connection lost";
                    }
                    node.status({fill: "red", shape: "ring", text: info});
                }
            });

            this.on('input', function(msg) {
                var query,service;
                service = msg.hasOwnProperty('service') ? msg.service : node.service;
                if (!service) {
                    //query = {};
                    node.error(RED._("service must be specified"), msg);
                    return;
                }
                node.feathersConfig.client.service(service).create(msg.payload).then((res)=>{
                    msg.payload = res;
                    node.send(msg);
                }).catch((err)=>{
                    node.error(err);
                })
            });


        }
        else{
            this.error("Feathers client not configured");
        }
    }
    RED.nodes.registerType("feathers-create",FeathersCreateNode);

    function FeathersPatchNode(n) {
        RED.nodes.createNode(this,n);
        //console.log(n);
        this.feathconf = n.feathconf;
        this.service = n.service;
        this.id = n.id;
        this.feathersConfig = RED.nodes.getNode(this.feathconf);

        if (this.feathersConfig) {
            this.feathersConfig.connect();
            var node = this;
            var busy = false;
            var status = {};
            node.feathersConfig.on("state", function (info) {
                if (info === "connecting") {
                    node.status({fill: "grey", shape: "ring", text: info});
                } else if (info === "connected") {
                    node.status({fill: "green", shape: "dot", text: info});
                } else {
                    if (info === "ECONNREFUSED") {
                        info = "connection refused";
                    }
                    if (info === "PROTOCOL_CONNECTION_LOST") {
                        info = "connection lost";
                    }
                    node.status({fill: "red", shape: "ring", text: info});
                }
            });

            this.on('input', function(msg) {
                var query,service, id;
                service = msg.hasOwnProperty('service') ? msg.service : node.service;
                if (!service) {
                    //query = {};
                    node.error(RED._("service must be specified"), msg);
                    return;
                }
                if (!id) {
                    //query = {};
                    node.error(RED._("ID must be specified"), msg);
                    return;
                }
                node.feathersConfig.client.service(service).patch(id,msg.payload).then((res)=>{
                    msg.payload = res.data;
                    node.send(msg);
                }).catch((err)=>{
                    node.error(err);
                })
            });


        }
        else{
            this.error("Feathers client not configured");
        }
    }
    RED.nodes.registerType("feathers-patch",FeathersPatchNode);

    function FeathersSubscribeNode(n) {
        RED.nodes.createNode(this,n);
        //console.log(n);
        this.feathconf = n.feathconf;
        this.service = n.service;
        this.method = n.method;
        this.feathersConfig = RED.nodes.getNode(this.feathconf);

        if (this.feathersConfig) {
            this.feathersConfig.connect();
            var node = this;
            var busy = false;
            var status = {};
            node.feathersConfig.on("state", function (info) {
                if (info === "connecting") {
                    node.status({fill: "grey", shape: "ring", text: info});
                } else if (info === "connected") {
                    node.status({fill: "green", shape: "dot", text: info});
                    var nservice = node.feathersConfig.client.service(node.service);
                    nservice.on(node.method,(message)=>{
                        console.log(message);
                        var msg = {
                            topic: `${node.service}-${node.method}`,
                            payload: message
                        };
                        node.send(msg);
                    });

                } else {
                    if (info === "ECONNREFUSED") {
                        info = "connection refused";
                    }
                    if (info === "PROTOCOL_CONNECTION_LOST") {
                        info = "connection lost";
                    }
                    node.status({fill: "red", shape: "ring", text: info});
                }
            });


        }
        else{
            this.error("Feathers client not configured");
        }
    }
    RED.nodes.registerType("feathers-subscribe",FeathersSubscribeNode);

    function FeathClientNode(n){
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;

        this.connected = false;
        this.connecting = false;

        var node = this;

        async function doConnect() {
            console.log('inside do connect');
            node.connecting = true;
            node.emit("state", "connecting");
            const url = `http://${node.host}:${node.port}`;
            const socket = io(url,{
                transports: ['websocket']
            });
            const client = feathers();

            client.configure(socketio(socket));
            client.configure(auth({
                storageKey: 'auth'
            }));

            let interval;

            try {

                await client.authenticate({
                    strategy: 'local',
                    email: node.credentials.user,
                    password: node.credentials.password
                });

                node.connecting = false;
                node.client = client;
                node.connected = true;
                node.emit("state", "connected");

                node.client.io.on('disconnect', (reason) => {
                    // Show offline message
                    console.log('*******client disconnect');
                });

                node.client.io.on('connection', (connection)=>{
                    console.log('*****connection');
                })

                node.client.on('logout', (reason)=>{
                    console.log('*****auto logout');
                    // lt.clearInterval(interval);
                });

                node.client.on('login', (reason)=>{
                    console.log('*****auto login', jwtDecode(reason.accessToken));

                    // interval = lt.setInterval(function() {
                    //     console.log('every 2 minutes');
                    //     processAuth();
                    //
                    // }, 1000 * 60 * 60 * 23);

                });


            } catch (err) {

                console.error('Authentication error', err);
                node.emit("state", err);
                node.error(err);
                node.tick = setTimeout(doConnect, reconnect);


            }



        }

        this.connect = function() {
            if (!this.connected && !this.connecting) {
                doConnect();
            }
        }

        this.on('close', function (done) {
            if (this.tick) { clearTimeout(this.tick); }
            // if (this.check) { clearInterval(this.check); }
            node.connected = false;
            node.emit("state"," ");
            node.client.logout();
            done();
            //node.pool.end(function (err) { done(); });
        });

    }

    RED.nodes.registerType("feathersconfig",FeathClientNode, {
        credentials: {
            user: {type: "text"},
            password: {type: "password"}
        }
    });
}
