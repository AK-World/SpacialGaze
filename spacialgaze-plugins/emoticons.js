/*
Emoticon plugin
This plugin allows you to use emoticons in both chat rooms (as long as they are enabled in the room) and private messages.
*/
'use strict';

const fs = require('fs');
let emoticons = {'facepalm': 'http://i.imgur.com/ylrqFwJ.png',
		 'feelsbd': 'http://i.imgur.com/TZvJ1lI.png',
		 'obama': 'https://cdn.rawgit.com/CreaturePhil/dem-feels/gh-pages/emotes/OObama.png',
		 'feelsblad': 'https://raw.githubusercontent.com/CreaturePhil/dem-feels/gh-pages/emotes/feelsbald.png',
		 'feelsbm': 'http://i.imgur.com/xwfJb2z.png',
		 'feelscool': 'https://cdn.rawgit.com/CreaturePhil/dem-feels/gh-pages/emotes/feelsco.png',
		 'feelscop': 'http://i.imgur.com/eNaFHvR.png',
		 'feelscrazy': 'https://raw.githubusercontent.com/CreaturePhil/dem-feels/gh-pages/emotes/feelscr.png',
		 'feelscri': 'http://i.imgur.com/QAuUW7u.jpg',
		 'feelsdra': 'https://i.imgur.com/ZIcl9Zy_d.jpg',
		 'feelsgd': 'https://i.imgur.com/Jf0n4BL_d.jpg',
		 'feelsgm': 'https://cdn.rawgit.com/CreaturePhil/dem-feels/gh-pages/emotes/feelsgm.png',
		 'feelsgn': 'http://i.imgur.com/juJQh0J.png',
		 'feelshp': 'http://i.imgur.com/1W19BDG.png',
		 'feelsmd': 'http://i.imgur.com/DJHMdSw.png',
		 'feelsnerd': 'https://raw.githubusercontent.com/CreaturePhil/dem-feels/gh-pages/emotes/feelsnerd.png',
		 'feelsnv': 'https://i.imgur.com/XF6kIdJ_d.jpg',
		 'feelsok': 'http://i.imgur.com/gu3Osve.png',
		 'feelsrg': 'http://i.imgur.com/DsRQCsI.png',
		 'feelsrs': 'http://i.imgur.com/qGEot0R.png',
		 'feelssc': 'http://i.imgur.com/cm6oTZ1.png',
		 'feelsweird': 'https://cdn.betterttv.net/emote/5603731ce5fc5eff1de93229/2x',
		 'hmmface': 'https://i.imgur.com/Z5lOwfZ_d.jpg',
		 'nigga': 'https://cdn.rawgit.com/CreaturePhil/dem-feels/gh-pages/emotes/niglol.png',
		 'xaa': 'http://i.imgur.com/V728AvL.png',
		 'wtfman': 'https://i.imgur.com/kwR8Re9_d.jpg',
		 'yayface': 'https://i.imgur.com/anY1jf8_d.jpg',
		 'trollface': 'http://cdn.overclock.net/a/a0/50x50px-ZC-a0e3f9a7_troll-troll-face.png',
		 'fuckya': 'http://i.imgur.com/ampqCZi.gif',
		 'feelstired': 'http://i.imgur.com/EgYViOs.jpg',
		 'feelssd': 'https://cdn.betterttv.net/emote/5613b7ca141069f91f48acca/2x'};
let emoteRegex = new RegExp('feelsbd', 'facepalm', 'obama', 'feelsblad', 'g');
SG.ignoreEmotes = {};
try {
	SG.ignoreEmotes = JSON.parse(fs.readFileSync('config/ignoreemotes.json', 'utf8'));
} catch (e) {}

function loadEmoticons() {
	try {
		emoticons = JSON.parse(fs.readFileSync('config/emoticons.json', 'utf8'));
		emoteRegex = [];
		for (let emote in emoticons) {
			emoteRegex.push(escapeRegExp(emote));
		}
		emoteRegex = new RegExp('(' + emoteRegex.join('|') + ')', 'g');
	} catch (e) {}
}
loadEmoticons();

function saveEmoticons() {
	fs.writeFileSync('config/emoticons.json', JSON.stringify(emoticons));
	emoteRegex = [];
	for (let emote in emoticons) {
		emoteRegex.push(emote);
	}
	emoteRegex = new RegExp('(' + emoteRegex.join('|') + ')', 'g');
}

function parseEmoticons(message) {
	if (emoteRegex.test(message)) {
		message = SG.parseMessage(message).replace(emoteRegex, function (match) {
			return '<img src="' + emoticons[match] + '" title="' + match + '" height="40" width="40">';
		});
		return message;
	}
	return false;
}
SG.parseEmoticons = parseEmoticons;

exports.commands = {
	blockemote: 'ignoreemotes',
	blockemotes: 'ignoreemotes',
	blockemoticon: 'ignoreemotes',
	blockemoticons: 'ignoreemotes',
	ignoreemotes: function (target, room, user) {
		this.parse('/emoticons ignore');
	},

	unblockemote: 'unignoreemotes',
	unblockemotes: 'unignoreemotes',
	unblockemoticon: 'unignoreemotes',
	unblockemoticons: 'unignoreemotes',
	unignoreemotes: function (target, room, user) {
		this.parse('/emoticons unignore');
	},

	emoticons: 'emoticon',
	emote: 'emoticon',
	emotes: 'emoticon',
	emoticon: function (target, room, user) {
		if (!target) target = 'help';
		let parts = target.split(',');
		for (let u in parts) parts[u] = parts[u].trim();

		switch (parts[0]) {
		case 'add':
			if (!this.can('roomowner')) return false;
			if (!parts[2]) return this.sendReply("Usage: /emoticon add, [name], [url] - Remember to resize the image first! (recommended 30x30)");
			if (emoticons[parts[1]]) return this.sendReply("\"" + parts[1] + "\" is already an emoticon.");
			emoticons[parts[1]] = parts[2];
			saveEmoticons();
			this.sendReply('|raw|The emoticon "' + Chat.escapeHTML(parts[1]) + '" has been added: <img src="' + parts[2] + '">');
			Rooms('upperstaff').add('|raw|' + SG.nameColor(user.name, true) + ' has added the emote "' + Chat.escapeHTML(parts[1]) +
				'": <img width="40" height="40" src="' + parts[2] + '">').update();
			SG.messageSeniorStaff('/html ' + SG.nameColor(user.name, true) + ' has added the emote "' + Chat.escapeHTML(parts[1]) +
				'": <img width="40" height="40" src="' + parts[2] + '">');
			break;

		case 'delete':
		case 'remove':
		case 'rem':
		case 'del':
			if (!this.can('roomowner')) return false;
			if (!parts[1]) return this.sendReply("Usage: /emoticon del, [name]");
			if (!emoticons[parts[1]]) return this.sendReply("The emoticon \"" + parts[1] + "\" does not exist.");
			delete emoticons[parts[1]];
			saveEmoticons();
			this.sendReply("The emoticon \"" + parts[1] + "\" has been removed.");
			break;

		case 'on':
		case 'enable':
		case 'disable':
		case 'off':
			if (!this.can('roommod', null, room)) return this.sendReply('Access denied.');
			let status = ((parts[0] !== 'enable' && parts[0] !== 'on'));
			if (room.disableEmoticons === status) return this.sendReply("Emoticons are already " + (status ? "disabled" : "enabled") + " in this room.");
			room.disableEmoticons = status;
			room.chatRoomData.disableEmoticons = status;
			Rooms.global.writeChatRoomData();
			this.privateModCommand('(' + user.name + ' ' + (status ? ' disabled ' : ' enabled ') + 'emoticons in this room.)');
			break;

		case 'view':
		case 'list':
			if (!this.runBroadcast()) return;
			let reply = "<b><u>Emoticons (" + Object.keys(emoticons).length + ")</u></b><br />";
			for (let emote in emoticons) reply += "(" + emote + " <img src=\"" + emoticons[emote] + "\" height=\"40\" width=\"40\">) ";
			this.sendReply('|raw|<div class="infobox infobox-limited">' + reply + '</div>');
			break;

		case 'ignore':
			if (SG.ignoreEmotes[user.userid]) return this.errorReply("You are already ignoring emoticons.");
			SG.ignoreEmotes[user.userid] = true;
			fs.writeFileSync('config/ignoreemotes.json', JSON.stringify(SG.ignoreEmotes));
			this.sendReply("You are now ignoring emoticons.");
			break;

		case 'unignore':
			if (!SG.ignoreEmotes[user.userid]) return this.errorReply("You aren't ignoring emoticons.");
			delete SG.ignoreEmotes[user.userid];
			fs.writeFileSync('config/ignoreemotes.json', JSON.stringify(SG.ignoreEmotes));
			this.sendReply("You are no longer ignoring emoticons.");
			break;

		default:
		case 'help':
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				"Emoticon Commands:<br />" +
				"<small>/emoticon may be substituted with /emoticons, /emotes, or /emote</small><br />" +
				"/emoticon add, [name], [url] - Adds an emoticon.<br />" +
				"/emoticon del/delete/remove/rem, [name] - Removes an emoticon.<br />" +
				"/emoticon enable/on/disable/off - Enables or disables emoticons in the current room.<br />" +
				"/emoticon view/list - Displays the list of emoticons.<br />" +
				"/emoticon ignore - Ignores emoticons in chat messages.<br />" +
				"/emoticon unignore - Unignores emoticons in chat messages.<br />" +
				"/emoticon help - Displays this help command.<br />" +
				"<a href=\"https://gist.github.com/jd4564/ef66ecc47c58b3bb06ec\">Emoticon Plugin by: jd</a>"
			);
			break;
		}
	},
};

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // eslint-disable-line no-useless-escape
}
