'use strict';

const _ = require('lodash');
const App = require('../app.js');
const app = App.getInstance();

const uniqid = require('uniqid');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;

module.exports = class PostQuestionController 
{

	connect(socket) 
	{
		const table_name = 'post_questions';

		socket.on('submitPostQuestion', async function(data, callback) {
			console.log(app.dd(), 'submitPostQuestion(data)', data);

			data.hid = uniqid();
			data.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
			
			var item = await app.master.addItem(table_name, data);
			app.io.to('admin').emit('onGlobalSubmitPostQuestion', {item, dt:app.dt()});
			return callback({message:'success',dt:app.dt()});
		});

		socket.on('getPostQuestions', async function(room) {
			console.log(app.dd(), 'getPostQuestions(room)', room);
			var items = await app.master.getItems(table_name, {room});
			socket.emit('onGetPostQuestions', {items,dt:app.dt()});
		});

		socket.on('sendPostQuestions', async function(ids) {
			console.log(app.dd(), 'sendPostQuestions(ids)', ids);
			await app.master.updateItems(table_name, { _id: { $in: ids.map(_id => ObjectId(_id)) } }, {is_sent: true});
			var items = await app.master.getItems(table_name, { _id: { $in: ids.map(_id => ObjectId(_id)) } });
			socket.emit('onSendPostQuestions', {dt:app.dt(),message:'updated'});
			app.io.emit('onGlobalSendPostQuestions', {items,dt:app.dt(),message:'updated'});
		});

		socket.on('selectPostQuestion', async function(room, hid) {
			console.log(app.dd(), 'selectPostQuestion(room, hid)', room, hid);
			await app.master.updateItems(table_name, {room, selected:true}, {selected:false});
			await app.master.updateItem(table_name, {hid}, {selected:true});
			var item = await app.master.getItem(table_name, {hid});
			// socket.emit('onSelectedPostQuestion', {item, dt:app.dt(), message:'success'});
			app.io.emit('onGlobalSelectedPostQuestion', {item,dt:app.dt()});
		});

		socket.on('unselectPostQuestion', async function(room) {
			console.log(app.dd(), 'unselectPostQuestion(room) ->', room);
			await app.master.updateItems(table_name, {room, selected:true}, {selected:false});
			app.io.emit('onGlobalUnselectedPostQuestion', {dt:app.dt(), item: room});
			return;
		});

		socket.on('getSelectedPostQuestion', async function(room) {
			console.log(app.dd(), 'getSelectedPostQuestion(room) ->', room);
			var item = await app.master.getItem(table_name, {room, selected:true});
			socket.emit('onGetSelectedPostQuestion', {dt:app.dt(),message:'success',item});
			return;
		});

		socket.on('removePostQuestion', async function(room, hid) {
			console.log(app.dd(), 'removePostQuestion', room, hid);
			await app.master.removeItemO(table_name, {hid});
			app.io.to('admin').emit('onRemovePostQuestion', {dt:app.dt(),item:{room, hid}});
		});

		socket.on('emptyPostQuestion', async function(room) {
			console.log(app.dd(), 'emptyPostQuestion(room)', room);
			await app.master.removeItemsO(table_name, {room});
			app.io.to('admin').emit('onEmptyPostQuestion', {dt:app.dt(), item:room});
		});

		socket.on('updatePostQuestionSentState', async function(post_question_id, is_sent) {
			console.log(app.dd(), 'updatePostQuestionSentState(post_question_id, is_sent)', post_question_id, is_sent);
			await app.master.updateItem(table_name, {_id:ObjectId(post_question_id)}, {is_sent});
			socket.emit('onUpdatePostQuestionSentState', {message:'updated',dt:app.dt()});
		});
	}
}






