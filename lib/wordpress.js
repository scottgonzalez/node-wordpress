var xmlrpc = require( "xmlrpc" ),
	fields = require( "./fields" );

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

		this.rpc.methodCall( "wp." + method, this.argsPrefix.concat( args ), fn );
	}
});

extend( Client.prototype, {
	getPost: function( id, fn ) {
		this.call( "getPost", id, function( error, post ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fields.from( post, "post" ) );
		});
	},

	getPosts: function( filter, fn ) {
		if ( typeof filter === "function" ) {
			fn = filter;
			filter = {};
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

		this.call( "getPosts", filter, function( error, posts ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, posts.map(function( post ) {
				return fields.from( post, "post" );
			}));
		});
	},

	createPost: function( data, fn ) {
		this.call( "newPost", fields.to( data, "post" ), fn );
	},

	// to remove a term, just set the terms and leave out the id that you want to remove
	// to remove a custom field, pass the id with no key or value
	editPost: function( id, data, fn ) {
		this.call( "editPost", id, fields.to( data, "post" ), fn );
	},

	deletePost: function( id, fn ) {
		this.call( "deletePost", id, fn );
	}
});

extend( Client.prototype, {
	getTaxonomy: function( name, fn ) {
		this.call( "getTaxonomy", name, function( error, taxonomy ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fields.from( taxonomy, "taxonomy" ) );
		});
	},

	getTaxonomies: function( fn ) {
		this.call( "getTaxonomies", function( error, taxonomies ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, taxonomies.map(function( taxonomy ) {
				return fields.from( taxonomy, "taxonomy" );
			}));
		});
	},

	getTerm: function( taxonomy, id, fn ) {
		this.call( "getTerm", taxonomy, id, function( error, term ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, fields.from( term, "term" ) );
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

		this.call( "getTerms", taxonomy, filter, function( error, terms ) {
			if ( error ) {
				return fn( error );
			}

			fn( null, terms.map(function( term ) {
				return fields.from( term, "term" );
			}));
		});
	},

	newTerm: function( data, fn ) {
		this.call( "newTerm", fields.to( data, "term" ), fn );
	},

	editTerm: function( id, data, fn ) {
		this.call( "editTerm", id, fields.to( data, "term" ), fn );
	},

	deleteTerm: function( taxonomy, id, fn ) {
		this.call( "deleteTerm", taxonomy, id, fn );
	}
});

module.exports = {
	Client: Client,

	createClient: function( settings ) {
		return new Client( settings );
	}
};
