/** @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */

var $ = require('jash');
var fs = require('fs');
var async = require('async');
var common = require('../common');
var logger = new common.Formatter('spritesheetMap');

exports.create = function(path, prependDir, targetFilename) {
	if (!fs.exists(path)) {
		fs.writeFile(path + "/" + targetFilename + ".json", JSON.stringify({}), 'utf8', function (err) {
			if (err) {
				logger.log(err);
			} else  {
				logger.log("wrote " + targetFilename + ".json to " + path);
			}
		});

		return;
	}
	
	async.parallel(fs.readdirSync(path).filter(function(f) {
		return /png$/.test(f);
	}).map(function(f) {
		var filename = path + '/' + f;
		var prepend = prependDir ? prependDir + "/" : "";
		var newPath = prepend + f;
		var ret = {};
		ret[newPath] = function(cb) {
			$.file(filename, function(s, o, e) {
				var parts = o.split(' ');
				cb(null, {
					w: +parts[4],
					h: +parts[6].slice(0, -1)
				});			
			});
		};
		return ret;
	}).reduce(function(memo, desc) {
		Object.keys(desc).forEach(function(k) {
			memo[k] = desc[k];
		});		
		return memo;
	}, {}), function(e, o) {
		fs.writeFile(path + "/" + targetFilename + ".json", JSON.stringify(o), function(err) {
			if(err) {
				logger.log(err);
			} else {
				logger.log("wrote " + targetFilename + ".json to " + path);
			}
		}); 
	});
};
