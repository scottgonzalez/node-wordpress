var maps = {};

function extend( a, b ) {
	for ( var p in b ) {
		a[ p ] = b[ p ];
	}

	return a;
}

function createFieldMaps( renames, toFns, fromFns ) {
	var to = extend( {}, renames ),
		from = {};

	Object.keys( renames ).forEach(function( key ) {
		from[ renames[ key ] ] = key;
	});

	return {
		to: extend( to, toFns ),
		from: extend( from, fromFns )
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

function toLocalDate( date ) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
		date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function toGmtDate( date ) {
	return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate() + " " +
		date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
}

maps.post = createFieldMaps({
	author: /* int */ "post_author",
	commentStatus: /* string */ "comment_status",
	content: /* string */ "post_content",
	customFields: /* array */ "custom_fields",
	excerpt: /* string */ "post_excerpt",
	format: /* string */"post_format",
	id: /* string */ "post_id", /* readonly */
	link: /* string */ "link" /* readonly */,
	name: /* string */ "post_name",
	parent: /* int */ "post_parent",
	password: /* string */ "post_password",
	pingStatus: /* string */ "ping_status",
	status: /* string */ "post_status",
	sticky: /* bool */ "sticky",
	terms: /* struct */ "terms" /* array */,
	termNames: /* struct */ "terms_names",
	thumbnail: /* int */ "post_thumbnail",
	title: /* string */ "post_title",
	type: /* string */ "post_type"
}, {
	date: /* datetime */ function( date ) {
		return {
			post_date: toLocalDate( date )
		};
	},
	modified: /* datetime */ function( date ) {
		return {
			post_modified: toLocalDate( date )
		};
	}
}, {
	post_date_gmt: /* datetime */ function( date ) {
		return {
			date: new Date( date )
		};
	},
	post_modified_gmt: /* datetime */ function( date ) {
		return {
			modified: new Date( date )
		};
	}
});

maps.taxonomy = createFieldMaps({
	cap: /* struct */ "cap",
	heirarchical: /* bool */ "heirarchical",
	name: /* string */ "name",
	label: /* string */ "label",
	labels: /* struct */ "labels",
	objectType: /* array */ "object_type",
	"public": /* bool */ "public",
	queryVar: /* string */ "query_var",
	rewrite: /* struct */ "rewrite",
	showInNavMenus: /* bool */ "show_in_nav_menus",
	showTagCloud: /* bool */ "show_tagcloud",
	showUi: /* bool */ "show_ui"
}, {}, {
	labels: function( labels ) {
		return { labels: mapFields( labels, maps.taxonomyLabels.from ) };
	}
});

maps.taxonomyLabels = createFieldMaps({
	name: "name",
	singularName: "singular_name",
	searchItems: "search_items",
	popularItems: "popular_items",
	allItems: "all_items",
	parentItem: "parent_item",
	parentItemColon: "parent_item_colon",
	editItem: "edit_item",
	viewItem: "view_item",
	updateItem: "update_item",
	addNewItem: "add_new_item",
	newItemName: "new_item_name",
	separateItemsWithCommas: "separate_items_with_commas",
	addOrRemoveItems: "add_or_remove_items",
	chooseFromMostUsed: "choose_from_most_used",
	menuName: "menu_name",
	nameAdminBar: "name_admin_bar"
});

maps.term = createFieldMaps({
	count: /* int */ "count", /* readonly */
	description: /* string */ "description",
	name: /* string */ "name",
	parent: /* string */ "parent",
	slug: /* string */ "slug",
	taxonomy: /* string */ "taxonomy",
	termId: /* string */ "term_id", /* readonly */
	termTaxonomyId: /* string */ "term_taxonomy_id" /* readonly */
});

module.exports = {
	to: function( data, type ) {
		return mapFields( data, maps[ type ].to );
	},
	from: function( data, type ) {
		return mapFields( data, maps[ type ].from );
	}
};
