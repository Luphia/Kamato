/*
 * Serve JSON to our AngularJS client
 */

module.exports = {
	init: function() {

	},
	file: function(req, res) {
		var filename = req.params.filename;
		res.writeHead(307, {
			"Location": "https://googledrive.com/host/0BzPHTgO9VGuOTU5vbV92bGVYNzQ/" + filename
		});
		res.end();
	}
};