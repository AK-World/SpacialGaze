/**
 * profile.js
 * Displays to users a profile of a given user.
 * For order's sake:
 * - vip, dev, customtitle, friendcode, and profile were placed in here.
 * Updated and restyled by Mystifi; main profile restyle goes out to panpawn/jd/other contributors.
 **/
'use strict';

let geoip = require('geoip-lite-country');

// fill in '' with the server IP
let serverIp = Config.serverIp;

function isVIP(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let vip = Db.vips.get(toId(user));
	if (vip === 1) return true;
	return false;
}

function isDev(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let dev = Db.devs.get(toId(user));
	if (dev === 1) return true;
	return false;
}

function showTitle(userid) {
	userid = toId(userid);
	if (Db.customtitles.has(userid)) {
		return '<font color="' + Db.customtitles.get(userid)[1] +
			'">(<b>' + Db.customtitles.get(userid)[0] + '</b>)</font>';
	}
	return '';
}

function devCheck(user) {
	if (isDev(user)) return '<font color="#009320">(<b>Developer</b>)</font>';
	return '';
}

function vipCheck(user) {
	if (isVIP(user)) return '<font color="#6390F0">(<b>VIP User</b>)</font>';
	return '';
}

function showBadges(user) {
	if (Db.userBadges.has(toId(user))) {
		let badges = Db.userBadges.get(toId(user));
		let css = 'border:none;background:none;padding:0;';
		if (typeof badges !== 'undefined' && badges !== null) {
			let output = '<td><div style="float: right; background: rgba(69, 76, 80, 0.4); text-align: center; border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset; margin: 0px 3px;">';
			output += ' <table style="' + css + '"> <tr>';
			for (let i = 0; i < badges.length; i++) {
				if (i !== 0 && i % 4 === 0) output += '</tr> <tr>';
				output += '<td><button style="' + css + '" name="send" value="/badges info, ' + badges[i] + '">' +
				'<img src="' + Db.badgeData.get(badges[i])[1] + '" height="16" width="16" alt="' + badges[i] + '" title="' + badges[i] + '" >' + '</button></td>';
			}
			output += '</tr> </table></div></td>';
			return output;
		}
	}
	return '';
}

function getteam(user) {
	let teamcss = 'float:center;border:none;background:none;';

	let noSprite = '<img src=http://play.pokemonshowdown.com/sprites/bwicons/0.png>';
	let one = Db.teams.get([user, 'one']);
	let two = Db.teams.get([user, 'two']);
	let three = Db.teams.get([user, 'three']);
	let four = Db.teams.get([user, 'four']);
	let five = Db.teams.get([user, 'five']);
	let six = Db.teams.get([user, 'six']);
	if (!Db.teams.has(user)) return '<div style="' + teamcss + '" >' + noSprite + noSprite + noSprite + noSprite + noSprite + noSprite + '</div>';

	function iconize(link) {
		return '<button id="kek" name="send" value="/dt ' + link + '" style="background:transparent;border:none;"><img src="http://www.serebii.net/pokedex-sm/icon/' + link + '.png"></button>';
	}
	//return '<div style="' + teamcss + '">' + '<br>' + iconize(one) + iconize(two) + iconize(three) + '<br>' + iconize(four) + iconize(five) + iconize(six) + '</div>';*/
	let teamDisplay = '<center><div style="' + teamcss + '">';
	if (Db.teams.has([user, 'one'])) {
		teamDisplay += iconize(one);
	} else {
		teamDisplay += noSprite;
	}
	if (Db.teams.has([user, 'two'])) {
		teamDisplay += iconize(two);
	} else {
		teamDisplay += noSprite;
	}
	if (Db.teams.has([user, 'three'])) {
		teamDisplay += iconize(three);
	} else {
		teamDisplay += noSprite;
	}
	if (Db.teams.has([user, 'four'])) {
		teamDisplay += iconize(four);
	} else {
		teamDisplay += noSprite;
	}
	if (Db.teams.has([user, 'five'])) {
		teamDisplay += iconize(five);
	} else {
		teamDisplay += noSprite;
	}
	if (Db.teams.has([user, 'six'])) {
		teamDisplay += iconize(six);
	} else {
		teamDisplay += noSprite;
	}
	teamDisplay += '</div></center>';
	return teamDisplay;
};

exports.commands = {
	vip: {
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isVIP(vipUsername)) return this.errorReply(vipUsername + " is already a VIP user.");
			Db.vips.set(vipUsername, 1);
			this.sendReply("|html|" + SG.nameColor(vipUsername, true) + " has been given VIP status.");
			if (Users.get(vipUsername)) Users(vipUsername).popup("|html|You have been given VIP status by " + SG.nameColor(user.name, true) + ".");
		},
		take: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isVIP(vipUsername)) return this.errorReply(vipUsername + " isn't a VIP user.");
			Db.vips.remove(vipUsername);
			this.sendReply("|html|" + SG.nameColor(vipUsername, true) + " has been demoted from VIP status.");
			if (Users.get(vipUsername)) Users(vipUsername).popup("|html|You have been demoted from VIP status by " + SG.nameColor(user.name, true) + ".");
		},
		users: 'list',
		list: function (target, room, user) {
			if (!Db.vips.keys().length) return this.errorReply('There seems to be no user with VIP status.');
			let display = [];
			Db.vips.keys().forEach(vipUser => {
				display.push(SG.nameColor(vipUser, (Users(vipUser) && Users(vipUser).connected)));
			});
			this.popupReply('|html|<b><u><font size="3"><center>VIP Users:</center></font></u></b>' + display.join(','));
		},
		'': 'help',
		help: function (target, room, user) {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/vip</code> commands.<br />These commands are nestled under the namespace <code>vip</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> VIP status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s VIP status. Requires: & ~' +
				'<br />' +
				'<code>list</code>: Shows list of users with VIP Status' +
				'</div>'
			);
		},
	},
	dev: {
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isDev(devUsername)) return this.errorReply(devUsername + " is already a DEV user.");
			Db.devs.set(devUsername, 1);
			this.sendReply('|html|' + SG.nameColor(devUsername, true) + " has been given DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("|html|You have been given DEV status by " + SG.nameColor(user.name, true) + ".");
		},
		take: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isDev(devUsername)) return this.errorReply(devUsername + " isn't a DEV user.");
			Db.devs.remove(devUsername);
			this.sendReply("|html|" + SG.nameColor(devUsername, true) + " has been demoted from DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("|html|You have been demoted from DEV status by " + SG.nameColor(user.name, true) + ".");
		},
		users: 'list',
		list: function (target, room, user) {
			if (!Db.devs.keys().length) return this.errorReply('There seems to be no user with DEV status.');
			let display = [];
			Db.devs.keys().forEach(devUser => {
				display.push(SG.nameColor(devUser, (Users(devUser) && Users(devUser).connected)));
			});
			this.popupReply('|html|<b><u><font size="3"><center>DEV Users:</center></font></u></b>' + display.join(','));
		},
		'': 'help',
		help: function (target, room, user) {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/dev</code> commands.<br />These commands are nestled under the namespace <code>dev</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> DEV status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s DEV status. Requires: & ~' +
				'<br />' +
				'<code>list</code>: Shows list of users with DEV Status' +
				'</div>'
			);
		},
	},
	title: 'customtitle',
	customtitle: {
		set: 'give',
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			target = target.split(',');
			if (!target || target.length < 3) return this.parse('/help', true);
			let userid = toId(target[0]);
			let targetUser = Users.getExact(userid);
			let title = target[1].trim();
			if (Db.customtitles.has(userid) && Db.titlecolors.has(userid)) {
				return this.errorReply(userid + " already has a custom title.");
			}
			let color = target[2].trim();
			if (color.charAt(0) !== '#') return this.errorReply("The color needs to be a hex starting with '#'.");
			Db.customtitles.set(userid, [title, color]);
			if (Users.get(targetUser)) {
				Users(targetUser).popup(
					'|html|You have recieved a custom title from ' + SG.nameColor(user.name, true) + '.' +
					'<br />Title: ' + showTitle(toId(targetUser)) +
					'<br />Title Hex Color: ' + color
				);
			}
			this.logModCommand(user.name + " set a custom title to " + userid + "'s profile.");
			Monitor.adminlog(user.name + " set a custom title to " + userid + "'s profile.");
			return this.sendReply("Title '" + title + "' and color '" + color + "' for " + userid + "'s custom title have been set.");
		},
		take: 'remove',
		remove: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let userid = toId(target);
			if (!Db.customtitles.has(userid) && !Db.titlecolors.has(userid)) {
				return this.errorReply(userid + " does not have a custom title set.");
			}
			Db.titlecolors.remove(userid);
			Db.customtitles.remove(userid);
			if (Users.get(userid)) {
				Users(userid).popup(
					'|html|' + SG.nameColor(user.name, true) + " has removed your custom title."
				);
			}
			this.logModCommand(user.name + " removed " + userid + "'s custom title.");
			Monitor.adminlog(user.name + " removed " + userid + "'s custom title.");
			return this.sendReply(userid + "'s custom title and title color were removed from the server memory.");
		},
		'': 'help',
		help: function (target, room, user) {
			if (!user.autoconfirmed) return this.errorReply("You need to be autoconfirmed to use this command.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(
				'<center><code>/customtitle</code> commands<br />' +
				'All commands are nestled under the namespace <code>customtitle</code>.</center>' +
				'<hr width="100%">' +
				'- <code>[set|give] [username], [title], [hex color]</code>: Sets a user\'s custom title. Requires: & ~' +
				'- <code>[take|remove] [username]</code>: Removes a user\'s custom title and erases it from the server. Requires: & ~'
			);
		},
	},
		addmon: 'addteam',
	addteam: function (target, room, user) {
		if (!Db.hasteam.has(user.userid)) return this.errorReply('You dont have access to edit your team.');
		if (!target) return this.parse('/teamhelp');
		let parts = target.split(',');
		let mon = parts[1].trim();
		let slot = parts[0];
		if (!parts[1]) return this.parse('/teamhelp');
		let acceptable = ['one', 'two', 'three', 'four', 'five', 'six'];
		if (!acceptable.includes(slot)) return this.parse('/teamhelp');
		if (slot === 'one' || slot === 'two' || slot === 'three' || slot === 'four' || slot === 'five' || slot === 'six') { 
			Db.teams.set([user, slot], mon);
			this.sendReplyBox('You have added this pokemon to your team.');
		} else {
			return this.parse('/teamhelp');
		}
	},
		giveteam: function (target, room, user) {
		if (!this.can('broadcast')) return false;
		if (!target) return this.errorReply('USAGE: /giveteam USER');
		let person = target.toLowerCase().trim();
			Db.hasteam.set(user, 1);
		this.sendReply(person + ' has been given the ability to set their team.');
		Users(user).popup('You have been given the ability to set your profile team.');
	},

	taketeam: function (target, room, user) {
		if (!this.can('broadcast')) return false;
		if (!target) return this.errorReply('USAGE: /taketeam USER');
		if (!Db.hasteam.has(user)) return this.errorReply('This user does not have the ability to set their team.');
		Db.hasteam.delete(user);
		this.sendReply('this user has had their ability to change their team taken from them.');
		Users(user).popup('You have been stripped of your ability to set your team.');
	},

	teamhelp: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox('<center><b>Teams In Profiles - Coded By Execute, edited by DeathlyPlays :3</b></center><br><br>' +
			'<b>/addmon (slot), (dex number) -</b >usage. The dex number must be the actual dex number of the pokemon you want.<br>' +
			'FYI: Slot - we mean what slot you want the pokemon to be. valid entries for this are: one, two, three, four, five, six.<br>' +
			'Chosing the right slot is crucial because if you chose a slot that already has a pokemon, it will overwrite that data and replace it. This can be used to replace / reorder what pokemon go where.<br>' +
			'If the Pokemon is in the first 99 Pokemon, do 0(number), and for Megas do (dex number)-Mega.<br>' +
			'For example: Mega Venusaur would be 003-Mega');
	},
	setpet: function (target, room, user) {
		if (!target) return this.errorReply('USAGE: /setpet target, slot (one or two), pokemon name');
		let targets = target.split(',');
		for (let u = 0; u < targets.length; u++) targets[u] = targets[u].trim();
		let targetUser = targets[0].toLowerCase().trim();
		let slot = targets[1];
		let pets = targets[2].toLowerCase();
		let acceptable = ['one', 'two'];
		if (!acceptable.includes(slot)) return this.errorReply('USAGE: /setpet target, slot (one or two), pokemon name');
		if (!targets[2]) return this.errorReply('USAGE: /setpet target, slot (one or two), pokemon name');
		if (slot === 'one' || slot === 'two') {
			Db('pets').set([targetUser, slot], pets);
			this.parse('/profile ' + targetUser);
		}
	},
	crush: {
		add: 'set',
		set: function (target, room, user) { 
			/* if (!room.battles) return this.errorReply("Please use this command outside of battle rooms"); */
			/*if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command."); */
			if (!target) return this.parse('/help', true); 
			let crush = target; 
			Db.crush.set(toId(user), crush); 
			return this.sendReply("Your crush " + crush + " has been saved to the server."); 
		}, 
	remove: "delete", 
	delete: function (target, room, user) { 
		if (!target) { 
		if(!Db.crush.has(toId(user))) return this.errorReply("Your crush isn't set");
			Db.crush.remove(toId(userid)); 
			return this.sendReply("Your crush has been removed"); 
		} else {
				if (!this.can('lock')) return false;
				let userid = toId(target);
				if (!Db.crush.has(userid)) return this.errorReply(userid + " hasn't set a crush.");
				Db.crush.remove(userid);
				return this.sendReply(userid + "'s crush has been deleted from the server.");
			}
	},
	'': 'help',
	help: function (target, room, user) {
		if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
		if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
		return this.sendReplyBox(
				'<center><code>crush</code> Commands<br />' +
				'All commands are nestled under the namespace <code>crush</code>.</center>' +
				'<hr width="100%">' +
				'<code>[add|set] [crush]</code>: Sets your crush.' +
				'<br />' +
				'<code>[remove|delete]</code>: Removes your crush. Global staff can include <code>[username]</code> to delete a user\'s crush.' +
				'<br />' +
				'<code>help</code>: Displays this help command.'
			);
		},
	},
	fc: 'friendcode',
	friendcode: {
		add: 'set',
		set: function (target, room, user) {
			if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
			if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
			if (!target) return this.parse('/help', true);
			let fc = target;
			fc = fc.replace(/-/g, '');
			fc = fc.replace(/ /g, '');
			if (isNaN(fc)) {
				return this.errorReply("Your friend code needs to contain only numerical characters.");
			}
			if (fc.length < 12) return this.errorReply("Your friend code needs to be 12 digits long.");
			fc = fc.slice(0, 4) + '-' + fc.slice(4, 8) + '-' + fc.slice(8, 12);
			Db.friendcodes.set(toId(user), fc);
			return this.sendReply("Your friend code: " + fc + " has been saved to the server.");
		},
		remove: 'delete',
		delete: function (target, room, user) {
			if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
			if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
			if (!target) {
				if (!Db.friendcodes.has(toId(user))) return this.errorReply("Your friend code isn't set.");
				Db.friendcodes.remove(toId(user));
				return this.sendReply("Your friend code has been deleted from the server.");
			} else {
				if (!this.can('lock')) return false;
				let userid = toId(target);
				if (!Db.friendcodes.has(userid)) return this.errorReply(userid + " hasn't set a friend code.");
				Db.friendcodes.remove(userid);
				return this.sendReply(userid + "'s friend code has been deleted from the server.");
			}
		},
		'': 'help',
		help: function (target, room, user) {
			if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
			if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
			return this.sendReplyBox(
				'<center><code>/friendcode</code> commands<br />' +
				'All commands are nestled under the namespace <code>friendcode</code>.</center>' +
				'<hr width="100%">' +
				'<code>[add|set] [code]</code>: Sets your friend code. Must be in the format 111111111111, 1111 1111 1111, or 1111-1111-1111.' +
				'<br />' +
				'<code>[remove|delete]</code>: Removes your friend code. Global staff can include <code>[username]</code> to delete a user\'s friend code.' +
				'<br />' +
				'<code>help</code>: Displays this help command.'
			);
		},
	},
	'!profile': true,
	profile: function (target, room, user) {
		target = toId(target);
		if (!target) target = user.name;
		if (target.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
		if (!this.runBroadcast()) return;
		let self = this;
		let targetUser = Users.get(target);
		let username = (targetUser ? targetUser.name : target);
		let userid = (targetUser ? targetUser.userid : toId(target));
		let avatar = (targetUser ? (isNaN(targetUser.avatar) ? "http://" + serverIp + "/avatars/" + targetUser.avatar : "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar + ".png") : (Config.customavatars[userid] ? "http://" + serverIp + ":" + Config.port + "/avatars/" + Config.customavatars[userid] : "http://play.pokemonshowdown.com/sprites/trainers/1.png"));
		if (targetUser && targetUser.avatar[0] === '#') avatar = 'http://play.pokemonshowdown.com/sprites/trainers/' + targetUser.avatar.substr(1) + '.png';
		let userSymbol = (Users.usergroups[userid] ? Users.usergroups[userid].substr(0, 1) : "Regular User");
		let userGroup = (Config.groups[userSymbol] ? 'Global ' + Config.groups[userSymbol].name : "Regular User");
		let regdate = '(Unregistered)';
		SG.regdate(userid, date => {
			if (date) {
				let d = new Date(date);
				let MonthNames = ["January", "February", "March", "April", "May", "June",
					"July", "August", "September", "October", "November", "December",
				];
				regdate = MonthNames[d.getUTCMonth()] + ' ' + d.getUTCDate() + ", " + d.getUTCFullYear();
			}
			showProfile();
		});

		function getLastSeen(userid) {
			if (Users(userid) && Users(userid).connected) return '<font color = "limegreen"><strong>Currently Online</strong></font>';
			let seen = Db.seen.get(userid);
			if (!seen) return '<font color = "red"><strong>Never</strong></font>';
			return Chat.toDurationString(Date.now() - seen, {precision: true}) + " ago.";
		}

		function getFlag(userid) {
			let ip = (Users(userid) ? geoip.lookup(Users(userid).latestIp) : false);
			if (!ip || ip === null) return '';
			return '<img src="http://flags.fmcdn.net/data/flags/normal/' + ip.country.toLowerCase() + '.png" alt="' + ip.country + '" title="' + ip.country + '" width="20" height="10">';
		}

		function showProfile() {
			Economy.readMoney(toId(username), currency => {
				let profile = '';
				profile += showBadges(toId(username));
				profile += '<img src="' + avatar + '" height="80" width="80" align="left">';
				profile += '&nbsp;<font color="#24678d"><b>Name:</b></font> ' + SG.nameColor(username, true) + '&nbsp;' + getFlag(toId(username)) + ' ' + showTitle(username) + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>Group:</b></font> ' + userGroup + ' ' + devCheck(username) + vipCheck(username) + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>Registered:</b></font> ' + regdate + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>' + global.currencyPlural + ':</b></font> ' + currency + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>Last Seen:</b></font> ' + getLastSeen(toId(username)) + '</font><br />';
				if (Db.crush.has(toId(username))) {
					profile += '&nbsp;<font color="#24678d"><b>Crush:</b></font> ' + Db.crush.get(toId(username)) +'<br />';
					
				} /*
				if (Db.friendcodes.has(toId(username))) {
					profile += '&nbsp;<font color="#24678d"><b>Friend Code:</b></font> ' + Db.friendcodes.get(toId(username)) +'<br />';
					
				}*/ /*
				profile += getteam(user)*/
				
				
				
				profile += '<br clear="all">';
				self.sendReplyBox(profile);
			});
		}
	},
};
