var mysql = require( "mysql" ),
	tables = [
		"options",
		"postmeta",
		"posts",
		"terms",
		"term_relationships",
		"term_taxonomy"
	],
	fieldMaps = {};

function extend( a, b ) {
	for ( var p in b ) {
		a[ p ] = b[ p ];
	}

	return a;
}

function toLocalDate( date ) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
		date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function toGmtDate( date ) {
	return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate() + " " +
		date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
}

function createFieldMaps( renames, toDbFns, fromDbFns ) {
	var toDb = extend( {}, renames ),
		fromDb = {};
	Object.keys( renames ).forEach(function( key ) {
		fromDb[ renames[ key ] ] = key;
	});
	return {
		toDb: extend( toDb, toDbFns ),
		fromDb: extend( fromDb, fromDbFns )
	};
}

function mapFields( data, map ) {
	var field, value, mappedField,
		ret = {};

	for ( field in data ) {
		value = data[ field ];
		mappedField = map[ field ];

		// no map -> delete
		if ( !mappedField ) {
			continue;
		// string -> change field name
		} else if ( typeof mappedField === "string" ) {
			ret[ mappedField ] = value;
		// function -> merge result
		} else {
			extend( ret, mappedField( value ) );
		}
	}

	return ret;
}

function Client( settings ) {
	this.settings = settings;
	this.db = mysql.createClient({
		host: settings.host,
		port: settings.port,
		user: settings.user,
		password: settings.password,
		database: settings.database
	});

	this.generateTableNames();
}

// internal
extend( Client.prototype, {
	generateTableNames: function() {
		var settings = this.settings,
			tablePrefix = "tablePrefix" in settings ? settings.prefix : "wp_",
			sitePrefix = "siteId" in settings ? settings.siteId + "_" : "",
			prefix = tablePrefix + sitePrefix;

		this.tables = {};
		tables.forEach(function( table ) {
			this.tables[ table ] = prefix + table;
		}.bind( this ) );
	}
});



/** posts **/

fieldMaps.posts = createFieldMaps({
	author: "post_author",
	commentStatus: "comment_status",
	commentCount: "comment_count",
	content: "post_content",
	contentFiltered: "post_content_filtered",
	excerpt: "post_excerpt",
	menuOrder: "menu_order",
	mimeType: "post_mime_type",
	name: "post_name",
	parent: "post_parent",
	password: "post_password",
	pingStatus: "ping_status",
	status: "post_status",
	title: "post_title",
	toPing: "to_ping",
	type: "post_type"
}, {
	date: function( date ) {
		return {
			post_date: toLocalDate( date ),
			post_date_gmt: toGmtDate( date )
		};
	},
	modified: function( date ) {
		return {
			post_modified: toLocalDate( date ),
			post_modified_gmt: toGmtDate( date )
		};
	}
}, {
	post_date_gmt: function( date ) {
		return {
			date: new Date( date )
		};
	},
	post_modified_gmt: function( date ) {
		return {
			modified: new Date( date )
		};
	}
});

extend( Client.prototype, {
	_queryPostFields: function( data ) {
		var field,
			fields = [],
			values = [];

		data = mapFields( data, fieldMaps.posts.toDb );
		for ( field in data ) {
			fields.push( "`" + field + "` = ?" );
			values.push( data[ field ] );
		}

		return {
			query: fields.join( ", " ),
			values: values
		};
	},

	createPost: function( data, fn ) {
		var now = new Date(),
			// TODO: default guid?
			queryData = this._queryPostFields( extend( {
				date: now,
				modified: now
			}, data ) ),
			query = "INSERT INTO `" + this.tables.posts + "` " +
				"SET " + queryData.query;

		this.db.query( query, queryData.values, function( error, info ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, info.insertId );
		});
	},

	updatePost: function( id, data, fn ) {
		var now = new Date(),
			queryData = this._queryPostFields( extend( {
				modified: now
			}, data ) ),
			query = "UPDATE `" + this.tables.posts + "` " +
				"SET " + queryData.query +
				"WHERE `ID` = ?";

		queryData.values.push( id );
		this.db.query( query, queryData.values, function( error, info ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, info.affectedRows ? id : null );
		});
	},

	removePost: function( id, fn ) {
		this.db.query( "DELETE FROM `" + this.tables.posts + "` " +
			"WHERE `ID` = ?", [ id ], function( error ) {
				fn( error );
			});
		// TODO: delete associated data
	},

	findPosts: function( data, fn ) {
		var queryData = this._queryPostFields( data ),
			query = "SELECT * FROM `" + this.tables.posts + "` " +
				"WHERE " + queryData.query;

		this.db.query( query, queryData.values, function( error, rows ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, rows.map(function( data ) {
				return mapFields( data, fieldMaps.posts.fromDb );
			}));
		});
	}
});



/** meta **/

extend( Client.prototype, {
	setMeta: function( postId, key, value, fn ) {
		var table = this.tables.postmeta;
		this.db.query( "SELECT `meta_id` FROM `" + table + "` " +
			"WHERE `post_id` = ? AND `meta_key` = ?",
			[ postId, key ], function( error, rows ) {
				if ( error ) {
					return fn( error );
				}

				if ( !rows.length ) {
					this.db.query( "INSERT INTO `" + table + "` SET " +
						"`post_id` = ?, `meta_key` = ?, `meta_value` = ?",
						[ postId, key, value ], function( error, info ) {
							if ( error ) {
								return fn( error );
							}

							fn( null, info.insertId );
						});
				} else {
					this.db.query( "UPDATE `" + table + "` SET " +
						"`meta_value` = ? WHERE `meta_id` = ?",
						[ value, rows[ 0 ].meta_id ], function( error ) {
							if ( error ) {
								return fn( error );
							}

							fn( null, rows[ 0 ].meta_id );
						});
				}
			}.bind( this ) );
	},

	getMeta: function( postId, key, fn ) {
		if ( typeof key === "function" ) {
			return this.getMetaAll( postId, key );
		}

		this.db.query( "SELECT `meta_value` FROM `" + this.tables.postmeta + "` " +
			"WHERE `post_id` = ? AND `meta_key` = ?",
			[ postId, key ], function( error, rows ) {
				if ( error ) {
					return fn( error );
				}

				if ( !rows.length ) {
					return fn( null, null );
				}

				fn( null, rows[ 0 ].meta_value );
			});
	},

	getMetaAll: function( postId, fn ) {
		this.db.query( "SELECT `meta_key`, `meta_value` " +
			"FROM `" + this.tables.postmeta + "` WHERE `post_id` = ?",
			[ postId ], function( error, rows ) {
				var ret = {};

				if ( error ) {
					return fn( error );
				}

				rows.forEach(function( row ) {
					ret[ row.meta_key ] = row.meta_value;
				});
				fn( null, ret );
			});
	},

	removeMeta: function( postId, key, fn ) {
		this.db.query( "DELETE FROM `" + this.tables.postmeta + "` " +
			"WHERE `post_id` = ? AND `meta_key` = ?",
			[ postId, key ], function( error ) {
				fn( error );
			});
	}
});



/** terms **/

extend( Client.prototype, {
	// TODO: clean slug (check WordPress for sanitization method)
	createTerm: function( name, slug, fn ) {
		this.db.query( "INSERT INTO `" + this.tables.terms + "` " +
			"SET `name` = ?, `slug` = ? " +
			"ON DUPLICATE KEY UPDATE `term_id` = LAST_INSERT_ID(`term_id`)",
			[ name, slug ], function( error, data ) {
				if ( error ) {
					return fn( error );
				}

				fn( null, data.insertId );
			});
	},

	createTermTaxonomy: function( termId, taxonomy, parent, fn ) {
		if ( typeof parent === "function" ) {
			fn = parent;
			parent = 0;
		}

		this.db.query( "INSERT INTO `" + this.tables.term_taxonomy + "` " +
			"SET `term_id` = ?, `taxonomy` = ?, `parent` = ? " +
			"ON DUPLICATE KEY UPDATE `term_taxonomy_id` = LAST_INSERT_ID(`term_taxonomy_id`)",
			[ termId, taxonomy, parent ], function( error, data ) {
				if ( error ) {
					return fn( error );
				}

				fn( null, data.insertId );
			});
	},

	createTermRelationship: function( objectId, taxonomyId, fn ) {
		this.db.query( "INSERT IGNORE INTO `" + this.tables.term_relationships + "` " +
			"SET `object_id` = ?, `term_taxonomy_id` = ? ",
			[ objectId, taxonomyId ], function( error ) {
				fn( error );
			}
		);
	}
});



/** tags **/

extend( Client.prototype, {
	// TODO: update count
	addTag: function( postId, tag, fn ) {
		this.createTerm( tag, tag, function( error, termId ) {
			if ( error ) {
				return fn( error );
			}

			this.createTermTaxonomy( termId, "post_tag", function( error, taxonomyId ) {
				if ( error ) {
					return fn( error );
				}

				this.createTermRelationship( postId, taxonomyId, function( error ) {
					fn( error );
				});
			}.bind( this ) );
		}.bind( this ) );
	},

	getTags: function( postId, fn ) {
		// TODO
	},

	removeTag: function( postId, tag, fn ) {
		// TODO
	}
});



/** categories **/

// TODO
extend( Client.prototype, {
	addCategory: function( postId, tag, fn ) {
		
	},

	getCategories: function( postId, fn ) {
		
	},

	removeCategory: function( postId, tag, fn ) {
		
	}
});



/** other **/

extend( Client.prototype, {
	flushRewriteRules: function( fn ) {
		this.db.query( "DELETE FROM `" + this.tables.options + "` " +
			"WHERE `option_name` = 'rewrite_rules'", function( error ) {
				fn( error );
			});
	},

	end: function() {
		if ( this.db ) {
			this.db.end();
			this.db = null;
		}
	}
});



/** expose **/

module.exports = {
	tables: tables,

	Client: Client,

	createClient: function( settings ) {
		return new Client( settings );
	}
};
