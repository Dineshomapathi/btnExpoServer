'use strict';

const moment = require('moment');
const _ = require('lodash');
const App = require('../app.js');
const app = App.getInstance();

module.exports = class SettingController 
{
	connect(socket) 
	{
		const table_name = 'settings';

		socket.on('openWarningNotification', async function() {
			console.log(app.dd(), 'openWarningNotification() ->');
			var item = await app.master.getItem(table_name, {});
			if(item.warning_text){
				app.io.emit('onGlobalOpenWarningNotification', {dt:app.dt(),message:item.warning_text});
				socket.emit('onOpenWarningNotification', {dt:app.dt(),message:'success'});
				return;
			}
		});
		
		socket.on('getSetting', async function() {
			console.log(app.dd(), 'getSetting() ->');
			var item = await app.master.getItem(table_name, {});
			if(!item){
				var data = { 
					stream_url: "https://player.vimeo.com/video/133599717?autoplay=1&loop=1" ,
					is_show_live_chat: true,
					is_show_post_question: true
				};
				item = await app.master.addItem(table_name, data);
			}
			item.current_dt = moment().format('YYYY-MM-DD HH:mm:ss');
			socket.emit('onGetSetting', {dt:app.dt(),item});
		});

		socket.on('updateSetting', async function(name, value) {
			console.log(app.dd(), 'updateSetting(name, value) ->', name, value);
			await app.master.updateItem(table_name, {}, {[name]: value});
			var item = {name,value};
			item.current_dt = moment().format('YYYY-MM-DD HH:mm:ss');
			// socket.emit('onUpdateSetting', {dt:app.dt(),item,message:'updated'});
			app.io.emit('onGlobalUpdateSetting', {dt:app.dt(),item,message:'updated'});
			if(item.name == "is_event_start" && item.value == false){
				await app.master.updateItems('users', {is_active: true, role: 'user'}, {socket_id:null, is_active: false});
				socket.emit('onActiveUser', {dt:app.dt(),message:'success'});
				app.io.emit('onGlobalDeactiveUser', {dt:app.dt(),message:'success'});
			}
		});


	}
}