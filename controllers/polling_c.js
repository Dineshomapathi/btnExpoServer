'use strict';

const _ = require('lodash');
const App = require('../app.js');

const app = App.getInstance();
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;

module.exports = class PollingController 
{
	connect(socket) 
	{
		const table_name = 'polling_questions';

		//ADMIN POLLING QUESTION
		socket.on('getPollingQuestions', async function(room, callback) {
			console.log(app.dd(), 'getPollingQuestions()', );
			var items = await app.master.getItems(table_name, {room});
			return callback({items, dt:app.dt()});
		});

		socket.on('getPollingDetails', async function(polling_id, callback) {
			console.log(app.dd(), 'getPollingDetails(polling_id)', polling_id);
			var item = await app.master.getItem(table_name, {_id:ObjectId(polling_id)});
			return callback({item, dt:app.dt()});
		});

		socket.on('addPollingQuestion', async function(polling_id, room, question, options, callback) {
			console.log(app.dd(), 'addPollingQuestion(polling_id, room, question, options)', polling_id, room, question, options);

			var data = {
				room, question, options,
				is_cast: false,
				is_show_result: false,
				created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
				updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
			}
			
			await app.master.addItem(table_name, data);
			return callback({message:'success', dt:app.dt()});
		});

		socket.on('updatePollingQuestion', async function(polling_id, room, question, options, callback) {
			console.log(app.dd(), 'updatePollingQuestion(polling_id, room, question, options)', polling_id, room, question, options);
			
			var updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
			await app.master.updateItem(table_name, {_id:ObjectId(polling_id)}, {room, question, options, updated_at});
			return callback({message:'success', dt:app.dt()});
		});

		socket.on('updateCastPolling', async function(room, polling_id, is_cast) {
			console.log(app.dd(), 'updateCastPolling(room, polling_id, is_cast)', room, polling_id, is_cast);
			await app.master.updateItem(table_name, {room, _id:ObjectId(polling_id)}, {is_cast, is_show_result: false});
			
			app.io.to('admin').emit('onUpdateCastPolling', {item:{polling_id, is_cast, type: 'is_cast'}, dt:app.dt(), message:'success'});
			
			var item = await app.master.getItem(table_name, {room, _id:ObjectId(polling_id)});
			if(is_cast){
				return app.io.emit('onGlobalCastPolling', {dt:app.dt(), message:'success', item});
			}

			app.io.to('admin').emit('onUpdateShowPollingResult', {item:{polling_id, is_show_result: false, type: 'is_show_result'}, dt:app.dt(), message:'success'});
			return app.io.emit('onGlobalStopPolling', {dt:app.dt(), message:'success', item});
		});

		socket.on('updateShowPollingResult', async function(room, polling_id, is_show_result) {
			console.log(app.dd(), 'updateShowPollingResult(room, polling_id, is_show_result)', room, polling_id, is_show_result);
			await app.master.updateItem(table_name, {room, _id:ObjectId(polling_id)}, {is_show_result});
			
			app.io.to('admin').emit('onUpdateShowPollingResult', {item:{polling_id, is_show_result, type: 'is_show_result'}, dt:app.dt(), message:'success'});
			
			
			if(is_show_result){
				var item = await calculatePollingResult(room, polling_id);
				return app.io.emit('onGlobalShowPollingResult', {dt:app.dt(), message:'success', item});
			}
			var item = await app.master.getItem(table_name, {room, _id:ObjectId(polling_id)});
			return app.io.emit('onGlobalHidePollingResult', {dt:app.dt(), message:'success', item});
		});

		socket.on('recastPollingQuestion', async function(room, polling_id) {
			console.log(app.dd(), 'recastPollingQuestion() ->', room, polling_id);
			var item = await app.master.getItem(table_name, {room, _id:ObjectId(polling_id)});
			if(!item) return '';

			if(item.is_cast){
				return app.io.emit('onGlobalCastPolling', {dt:app.dt(), message:'success', item});
			}
		});

		socket.on('reshowPollingResult', async function(room, polling_id) {
			console.log(app.dd(), 'reshowPollingResult() ->', room, polling_id);
			var item = await app.master.getItem(table_name, {room, _id:ObjectId(polling_id)});
			if(!item) return '';

			if(item.is_cast){
				var item = await calculatePollingResult(room, polling_id);
				return app.io.emit('onGlobalShowPollingResult', {dt:app.dt(), message:'success', item});
			}
		});

		socket.on('removePollingQuestion', async function(room, id) {
			console.log(app.dd(), 'removePollingQuestion(room, id) ->', room, id);
			await app.master.removeItem(table_name, id);
			return app.io.to('admin').emit('onRemovePollingQuestion', {dt:app.dt(), item:{room, id}});
		});

		socket.on('emptyPollingQuestions', async function(room) {
			console.log(app.dd(), 'emptyPollingQuestions(room) ->', room);
			await app.master.removeItemsO(table_name, {room});
			return app.io.to('admin').emit('onEmptyPollingQuestions', {dt:app.dt(), message:'success'});
		});





		//ADMIN POLLING ANSWER
		socket.on('getPollingAnswers', async function(room) {
			console.log(app.dd(), 'getPollingAnswers(room)', room);
			var items = await app.master.getItems('polling_answers', {room});
			socket.emit('onGetPollingAnswers', {items,dt:app.dt()});
		});

		socket.on('removePollingAnswer', async function(room, id) {
			console.log(app.dd(), 'removePollingAnswer', room, id);
			await app.master.removeItem('polling_answers', id);
			app.io.to('admin').emit('onRemovePollingAnswer', {dt:app.dt(),item:{room, id}});
		});

		socket.on('emptyPollingAnswer', async function(room) {
			console.log(app.dd(), 'emptyPollingAnswer(room)', room);
			await app.master.removeItemsO('polling_answers', {room});
			app.io.to('admin').emit('onEmptyPollingAnswer', {dt:app.dt(), item:room});
		});




		//USER POLLING 
		socket.on('getPollingItem', async function(room, user_hid, callback) {
			console.log(app.dd(), 'getPollingItem(room, user_hid)', room, user_hid);
			var item = await app.master.getItem('polling_questions', {room, is_cast: true});
			if(item){
				if(item.is_show_result){
					item = await calculatePollingResult(item.room, item._id.toString());
				}
			}

			var my_answers = await app.master.getItems('polling_answers', {room, user_hid});
			my_answers =  _.map(my_answers, (item) => _.pick(item, ['answer', 'polling_id']));

			callback({item, my_answers, dt:app.dt()});
		});

		socket.on('submitPolling', async function(obj, callback) {
			console.log(app.dd(), 'submitPolling(obj)', obj);
			var isSubmitted = await app.master.getItem('polling_answers', {user_hid: obj.user_hid, polling_id: obj.polling_id});
			if(isSubmitted){
				var message = {title: 'Failed to submit polling', text: 'You have sumbitted this polling before', type: 'warning'};
				callback({item, message, code: 500, dt: app.dt()});
			}

			obj.created_at = app.dt();
			var item = await app.master.addItem('polling_answers', obj);
			callback({item, code: 200, dt:app.dt()});
		});

		// socket.on('getMyPollingAnswers', async function(room, user_hid, callback) {
		// 	console.log(app.dd(), 'getMyPollingAnswers(room, user_hid)', room, user_hid);
		// 	var items = await app.master.getItems('polling_answers', {room, user_hid});
		// 	console.log('items', items);
		// 	items = _.map(items, (item) => _.pick(item, ['answer', 'polling_id']));
			
		// 	callback({items, dt:app.dt()});
		// });



		async function calculatePollingResult(room, polling_id){
			var answerCount;
			var answerPercent;

			var question = await app.master.getItem(table_name, {room, _id:ObjectId(polling_id)});
			var answers = await app.master.getItems('polling_answers', {room, polling_id});

			_.forEach(question.options, function( option, index ){
				answerCount = _.countBy(answers, answer_item => {
				    return answer_item.answer == option.text;
				}).true;
			   answerPercent = (answerCount? answerCount : 0) / answers.length * 100;
			   option.result = `${parseFloat(answerPercent? answerPercent : 0).toFixed(2)}%`;
			});

			// console.log('question', question);
			return question;
		}
	}
}






