
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Gamepad profiler', layout: false });
};
