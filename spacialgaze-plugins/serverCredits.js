'user strict'

exports.commands = {

	servercredits: 'credits',
	credits: "impcredits",
	impcredits: function (target, room, user) {
		let popup = "|html|" + "<font size=5 color=#F7189F><u><b>Impulse Credits:</b></u></font><br />" +
			"<br />" +
			"<u><b>Server Maintainers:</u></b><br />" +
			"- " + SG.nameColor('Prince Sky', true) + " (Owner, Development, CSS)<br />" +
      "- " + SG.nameColor('Dranzardite', true) + " (Owner)<br />" +
			"<br />" +
			"<u><b>Major Contributors:</b></u><br />" +
			"- " + SG.nameColor('Princess Qtie', true) + " (Development)<br />" +
			"- " + SG.nameColor('Shivay', true) + "(Development)<br />" +
			"- " + SG.nameColor('Kevin Neo Ryan', true) + "(Development)<br />" +
			"<br />" +
			"<u><b>Retired Staff:</b></u><br />" +
			"- " + SG.nameColor('General Draco', true) + " (Former Leader, Graphics Designer)<br />" +
			"<br />" +
			"<u><b>Special Thanks:</b></u><br />" +
			"- Our Staff Members<br />" +
			"- Our Regular Users<br />";
		user.popup(popup);
	},
};
