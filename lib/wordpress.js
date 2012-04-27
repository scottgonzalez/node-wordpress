var xmlrpc = require( "xmlrpc" ),
	fieldMap = require( "./fields" );

// http://codex.wordpress.org/XML-RPC_Support
// http://codex.wordpress.org/XML-RPC_WordPress_API

function extend( a, b ) {
	for ( var p in b ) {
		a[ p ] = b[ p ];
	}

	return a;
}

function Client( settings ) {
	this.settings = settings;
	// TODO: reduce to single setting and parse?
	this.rpc = xmlrpc.createClient({
		host: settings.host,
		port: settings.port,
		path: settings.path
	});
	this.argsPrefix = [
		settings.blogId || 0,
		settings.username,
		settings.password
	];
	// TODO: throw on missing settings
}

extend( Client.prototype, {
	call: function( method ) {
		var args = [].slice.call( arguments, 1 ),
			fn = args.pop();

		if ( typeof fn !== "function" ) {
			args.push( fn );
			fn = null;
		}

		this.rpc.methodCall( method, this.argsPrefix.concat( args ), fn );
	}
});

extend( Client.prototype, {
	getPost: function( id, fields, fn ) {
		if ( typeof fields === "function" ) {
			fn = fields;
			fields = null;
		}

		if ( fields ) {
			fields = fieldMap.array( fields, "post" );
		}

		this.call( "wp.getPost", id, fields, function( error, post ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fieldMap.from( post, "post" ) );
		});
	},

	getPosts: function( filter, fields, fn ) {
		if ( typeof filter === "function" ) {
			fn = filter;
			fields = null;
			filter = {};
		}

		if ( typeof fields === "function" ) {
			fn = fields;
			fields = null;
		}

		if ( filter.type ) {
			filter.post_type = filter.type;
			delete filter.type;
		}
		if ( filter.status ) {
			filter.post_status = filter.status;
			delete filter.status;
		}
		// TODO: map field name in filter.orderby?

		if ( fields ) {
			fields = fieldMap.array( fields, "post" );
		}

		this.call( "wp.getPosts", filter, fields, function( error, posts ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, posts.map(function( post ) {
				return fieldMap.from( post, "post" );
			}));
		});
	},

	newPost: function( data, fn ) {
		this.call( "wp.newPost", fieldMap.to( data, "post" ), fn );
	},

	// to remove a term, just set the terms and leave out the id that you want to remove
	// to remove a custom field, pass the id with no key or value
	editPost: function( id, data, fn ) {
		this.call( "wp.editPost", id, fieldMap.to( data, "post" ), fn );
	},

	deletePost: function( id, fn ) {
		this.call( "wp.deletePost", id, fn );
	},

	getPostType: function( name, fn ) {
		this.call( "wp.getPostType", name, function( error, postType ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fieldMap.from( postType, "postType" ) );
		});
	},

	getPostTypes: function( fn ) {
		this.call( "wp.getPostTypes", function( error, postTypes ) {
			if ( error ) {
				return fn( error );
			}

			Object.keys( postTypes ).forEach(function( postType ) {
				postTypes[ postType ] = fieldMap.from( postTypes[ postType ], "postType" );
			});
			fn( null, postTypes );
		});
	}
});

extend( Client.prototype, {
	getTaxonomy: function( name, fn ) {
		this.call( "wp.getTaxonomy", name, function( error, taxonomy ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fieldMap.from( taxonomy, "taxonomy" ) );
		});
	},

	getTaxonomies: function( fn ) {
		this.call( "wp.getTaxonomies", function( error, taxonomies ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, taxonomies.map(function( taxonomy ) {
				return fieldMap.from( taxonomy, "taxonomy" );
			}));
		});
	},

	getTerm: function( taxonomy, id, fn ) {
		this.call( "wp.getTerm", taxonomy, id, function( error, term ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fieldMap.from( term, "term" ) );
		});
	},

	getTerms: function( taxonomy, filter, fn ) {
		if ( typeof filter === "function" ) {
			fn = filter;
			filter = {};
		}

		if ( filter.hideEmpty ) {
			filter.hide_empty = filter.hideEmpty;
			delete filter.hideEmpty;
		}

		// TODO: map field name in filter.orderby?

		this.call( "wp.getTerms", taxonomy, filter, function( error, terms ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, terms.map(function( term ) {
				return fieldMap.from( term, "term" );
			}));
		});
	},

	newTerm: function( data, fn ) {
		this.call( "wp.newTerm", fieldMap.to( data, "term" ), fn );
	},

	editTerm: function( id, data, fn ) {
		this.call( "wp.editTerm", id, fieldMap.to( data, "term" ), fn );
	},

	deleteTerm: function( taxonomy, id, fn ) {
		this.call( "wp.deleteTerm", taxonomy, id, fn );
	}
});

module.exports = {
	Client: Client,

	createClient: function( settings ) {
		return new Client( settings );
	}
};
