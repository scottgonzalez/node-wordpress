var maps = {};

function extend(a, b) {
    for (var p in b) {
        a[ p ] = b[ p ];
    }

    return a;
}

function createFieldMaps(renames, toFns, fromFns) {
    var to = extend({}, renames),
        from = {};

    Object.keys(renames).forEach(function (key) {
        from[ renames[ key ] ] = key;
    });

    return {
        renames: renames,
        to: extend(to, toFns),
        from: extend(from, fromFns)
    };
}

function mapFields(data, map) {
    var field, value, mappedField,
        ret = {};

    for (field in data) {
        value = data[ field ];
        mappedField = map[ field ];

        // no map -> delete
        if (!mappedField) {
            continue;
            // string -> change field name
        } else if (typeof mappedField === "string") {
            ret[ mappedField ] = value;
            // function -> merge result
        } else {
            extend(ret, mappedField(value));
        }
    }

    return ret;
}

maps.labels = createFieldMaps({
    addNewItem: "add_new_item",
    addOrRemoveItems: "add_or_remove_items",
    allItems: "all_items",
    chooseFromMostUsed: "choose_from_most_used",
    editItem: "edit_item",
    menuName: "menu_name",
    name: "name",
    nameAdminBar: "name_admin_bar",
    newItemName: "new_item_name",
    parentItem: "parent_item",
    parentItemColon: "parent_item_colon",
    popularItems: "popular_items",
    searchItems: "search_items",
    separateItemsWithCommas: "separate_items_with_commas",
    singularName: "singular_name",
    updateItem: "update_item",
    viewItem: "view_item"
});

maps.post = createFieldMaps({
    author: /* int */ "post_author",
    commentStatus: /* string */ "comment_status",
    content: /* string */ "post_content",
    customFields: /* array */ "custom_fields",
    date: /* datetime */ "post_date",
    excerpt: /* string */ "post_excerpt",
    format: /* string */"post_format",
    id: /* string */ "post_id", /* readonly */
    link: /* string */ "link" /* readonly */,
    modified: /* datetime */ "post_modified",
    menuOrder: /* int */ "menu_order",
    name: /* string */ "post_name",
    pageTemplate: /* string */ "page_template",
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
}, {}, {
    post_date_gmt: /* datetime */ function (date) {
        return {
            date: new Date(date)
        };
    },
    post_modified_gmt: /* datetime */ function (date) {
        return {
            modified: new Date(date)
        };
    }
});

maps.postType = createFieldMaps({
    cap: /* struct */ "cap",
    capabilityType: /* string */ "capability_type",
    description: /* string */ "description",
    _editLink: /* string */ "_edit_link",
    excludeFromSearch: /* bool */ "exclude_from_search",
    hasArchive: /* bool */ "has_archive",
    heirarchical: /* bool */ "heirarchical",
    label: /* string */ "label",
    labels: /* struct */ "labels",
    mapMetaCap: /* bool */ "map_meta_cap",
    menuIcon: /* string */ "menu_icon",
    menuPosition: /* int */ "menu_position",
    name: /* string */ "name",
    "public": /* bool */ "public",
    publiclyQuerably: /* bool */ "publicly_queryable",
    queryVar: /* mixed */ "query_var",
    rewrite: /* mixed */ "rewrite",
    showInAdminBar: /* bool */ "show_in_admin_bar",
    showInMenu: /* bool */ "show_in_menu",
    showInNavMenus: /* bool */ "show_in_nav_menus",
    showUi: /* bool */ "show_ui",
    supports: /* array */ "supports",
    taxonomies: /* array */ "taxonomies"
}, {}, {
    cap: function (cap) {
        return { cap: mapFields(cap, maps.postTypeCap.from) };
    },
    labels: function (labels) {
        return { labels: mapFields(labels, maps.labels.from) };
    }
});

maps.postTypeCap = createFieldMaps({
    deleteOthersPosts: /* string */ "delete_others_posts",
    deletePost: /* string */ "delete_post",
    deletePosts: /* string */ "delete_posts",
    deletePrivatePosts: /* string */ "delete_private_posts",
    deletePublishedPosts: /* string */ "delete_published_posts",
    editOthersPosts: /* string */ "edit_others_posts",
    editPost: /* string */ "edit_post",
    editPosts: /* string */ "edit_posts",
    editPrivatePosts: /* string */ "edit_private_posts",
    editPublishedPosts: /* string */ "edit_published_posts",
    publishPosts: /* string */ "publish_posts",
    read: /* string */ "read",
    readPost: /* sring */ "read_post",
    readPrivatePosts: /* string */ "read_private_posts"
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
    cap: function (cap) {
        return { cap: mapFields(cap, maps.taxonomyCap.from) };
    },
    labels: function (labels) {
        return { labels: mapFields(labels, maps.labels.from) };
    }
});

maps.taxonomyCap = createFieldMaps({
    assignTerms: /* string */ "assign_terms",
    deleteTerms: /* string */ "delete_terms",
    editTerms: /* string */ "edit_terms",
    manageTerms: /* string */ "manage_terms"
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

maps.attachment = createFieldMaps({
        attachmentId: /* int */ "attachment_id",
        parent: /* int */ "parent",
        link: /* string */ "link",
        title: /* string */ "title",
        caption: /* string */ "caption",
        description: /* string */ "description",
        metadata: /* struct */ "metadata",
        imageMeta: /* struct */ "image_meta",
        thumbnail: /* string */ "thumbnail"
    }, {},
    {
        date_created_gmt: /* datetime */ function (date) {
            return {
                date: new Date(date)
            };
        },
        metadata: function (meta) {
            return { metadata: mapFields(meta, maps.attachmentMetadata.from) };
        },
        image_meta: function (meta) {
            return { imageMeta: mapFields(meta, maps.attachmentImageMeta.from) };
        }
    });

maps.attachmentMetadata = createFieldMaps({
    width: /* int */ "width",
    height: /* int */ "height",
    file: /* string */ "file",
    sizes: /* struct */ "sizes"

}, {}, {
    sizes: function (sizes) {
        return {
            thumbnail: mapFields(sizes.thumbnail, maps.attachmentSize.from),
            medium: mapFields(sizes.medium, maps.attachmentSize.from),
            large: mapFields(sizes.large, maps.attachmentSize.from)
        };
    }
});

maps.attachmentSize = createFieldMaps({
    file: /* string */ "file",
    width: /* string */ "width",
    height: /* string */ "height",
    mimeType: /* string */ "mime-type"
});

maps.attachmentImageMeta = createFieldMaps({
    aperture: /* int */ "aperture",
    credit: /* string */ "credit",
    camera: /* string */ "camera",
    caption: /* string */ "caption",
    createdTimestamp: /* int */ "created_timestamp",
    copyright: /* string */ "copyright",
    focalLength: /* int */ "focal_length",
    iso: /* int */ "iso",
    shutterSpeed: /* int */ "shutter_speed",
    title: /* string */ "title"
});

maps.file = createFieldMaps({
    id: /* string */ "id",
    file: /* string */ "file",
    url: /* string */ "url",
    type: /* string */ "type"
});

module.exports = {
    to: function (data, type) {
        return mapFields(data, maps[ type ].to);
    },
    from: function (data, type) {
        return mapFields(data, maps[ type ].from);
    },
    array: function (data, type) {
        var map = maps[ type ].renames;
        return data.map(function (field) {
            return map[ field ];
        });
    }
};
