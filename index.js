process.env.TZ = 'Asia/Kuala_Lumpur';
process.stdout.write('\033c');

require('es6-promise').polyfill();
const fs = require( 'fs' );
const express = require('express')();

var cors = require('cors')
express.use(cors())

const node_env = process.env.NODE_ENV || 'development';

console.log('http')
var http = require('http').Server(express);
var io = require('socket.io')(http, {'pingInterval': 2000, 'pingTimeout': 5000});
if (node_env != 'development') {
	const redis = require('socket.io-redis');
	io.adapter(redis({ 
		host:'127.0.0.1', 
		port: 6379, 
	}));
}

const axios = require('axios').default;
const moment = require('moment');
const _ = require('lodash');

const App = require('./app.js');
const Master = require('./models/master.js');
const Base = require('./models/base.js');

const SettingController = require('./controllers/setting_c');
const PollingController = require('./controllers/polling_c');
const LiveChatController = require('./controllers/live_chat_c');
const PostQuestionController = require('./controllers/post_question_c');

const app = App.getInstance();

function init() {
	app.is_cast = false;
	app.io = io;
	app.master = new Master();

	app.setting = new Base('settings');

	app.controller = {
		setting: new SettingController(),
		polling: new PollingController(),
		live_chat: new LiveChatController(),
		post_question: new PostQuestionController(),
	};
}

init();

io.on('connection', socket => {
	
	console.log(`Socket Server running on ${process.env.PORT} port, PID: ${process.pid}`);

	app.controller.setting.connect(socket);
	app.controller.polling.connect(socket);
	app.controller.live_chat.connect(socket);
	app.controller.post_question.connect(socket);

	// ----------------------------------------------------------------- //
	socket.on('message', async function(message) {
		console.log('message', message);
		io.emit('message', 'return '+message);
		var item = await app.master.addItem('settings', { helo:'world'});
		console.log('item',item)
	});

	socket.on('setIdentity', async function(user_hid, role) {
		console.log(app.dd(), 'setIdentity(socketId, user_hid, role) ->', socket.id, user_hid, role);
		socket.hid = user_hid;
		socket.role = role;
		if(role == 'admin' || role == 'contractor_admin' || role == 'speaker' || role == 'contractor_speaker'){
			console.log(app.dd(), 'joinAdminRoom(user_hid) ->', user_hid);
			socket.join('admin');
		}else{
			var settingItem = await app.master.getItem('settings');
			var isValidUser = await app.master.getItem('users', {hid: user_hid});
			
			if (!settingItem.is_event_start || !isValidUser) {
				return socket.emit('onLogoutSuccess', {dt:app.dt(),message:'success'});
			}
		}
		await app.master.addItem('sockets', {socket_id:socket.id, user_hid});
		socket.emit('onSetIdentity',{dt:app.dt(),message:'success'});
	});

	// socket.on('setRole', function(role) {
	// 	console.log(app.dd(), 'setRole(hid) ->', role);
	// 	socket.role = role;
	// 	socket.emit('setRole',{dt:app.dt(),message:'success'});
	// });

	socket.on('time', function(res) {
		console.log('receive time', res);
	});

});

var port_num = process.env.PORT  || 3011;
http.listen(port_num, function(){
	console.log(`- listen ${port_num}, OK`);
});

