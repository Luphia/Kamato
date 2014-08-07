/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.google = require('./google.js');