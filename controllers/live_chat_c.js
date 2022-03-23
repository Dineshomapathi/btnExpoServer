'use strict';

const _ = require('lodash');
const App = require('../app.js');
const app = App.getInstance();

const uniqid = require('uniqid');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;

module.exports = class LiveChatController 
{
	connect(socket) 
	{
		const table_name = 'live_chats';

		socket.on('sendLiveChatMessage', async function(data) {
			console.log(app.dd(), 'sendLiveChatMessage(data) ->', data);

			data.hid = uniqid();
			data.created_at = moment().format("YYYY-MM-DD HH:mm:ss");

			var item = await app.master.addItem(table_name, data);
			app.io.emit('onGlobalSendLiveChatMessage', {dt:app.dt(),item,message:'success',item})
			return;
		});

		socket.on('getLiveChatMessages', async function(room) {
			console.log(app.dd(), 'getLiveChatMessages(room) ->', room);
			var items = await app.master.getItems(table_name, {room});
			socket.emit('onGetLiveChatMessages', {dt:app.dt(),message:'success',items});
			return;
		});

		socket.on('getLiveChatMessagesL', async function(room) {
			console.log(app.dd(), 'getLiveChatMessagesL(room) ->', room);
			var items = await app.master.getItemsL(table_name, {room}, 200);
			socket.emit('onGetLiveChatMessagesL', {dt:app.dt(),message:'success',items});
			return;
		});

		socket.on('getModerators', async function() {
			console.log(app.dd(), 'getModerators() ->');
			var items = await app.master.getItems('users', {role: 'moderator'});
			items = _.map(items, (item) => item.hid);
			socket.emit('onGetModerators', {dt:app.dt(),message:'success',items});
			return;
		});

		socket.on('setPinMessage', async function(room, hid, obj) {
			console.log(app.dd(), 'setPinMessage(room, hid, obj) ->', room, hid, obj);
			await app.master.updateItems(table_name, {pin:true, room}, {pin:false});
			await app.master.updateItem(table_name, {hid}, {pin:true});
			var item = await app.master.getItem(table_name, {hid});
			app.io.emit('onSetPinMessage', {dt:app.dt(),message:'success',item});
			return;
		});

		socket.on('getPinMessage', async function(room) {
			console.log(app.dd(), 'getPinMessage(room) ->', room);
			var item = await app.master.getItem(table_name, {room, pin:true});
			socket.emit('onGetPinMessage', {dt:app.dt(),message:'success',item});
			return;
		});

		socket.on('removePinMessage', async function(room) {
			console.log(app.dd(), 'removePinMessage(room) ->', room);
			var item = await app.master.updateItems(table_name, {room, pin:true}, {pin:false});
			app.io.emit('onSetPinMessage', {dt:app.dt(),message:'success',item:{room}});
			return;
		});

		socket.on('removeMessage', async function(room, hid) {
			console.log(app.dd(), 'removeMessage(room, hid) ->', room, hid);
			await app.master.removeItemO(table_name, {hid});
			app.io.emit('onRemoveMessage', {dt:app.dt(),message:'success', item:{room, hid}});
			return;
		});

		socket.on('emptyLiveChat', async function(room) {
			console.log(app.dd(), 'emptyLiveChat(room) ->', room);
			await app.master.removeItemsO(table_name, {room});
			app.io.emit('onEmptyLiveChat', {dt:app.dt(),message:'success',item:room});
			return;
		});
	}
}
