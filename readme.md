# node-wordpress

A node.js JavaScript client for working with WordPress.

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).

Requires WordPress 3.4 or newer (uses the [WordPress XML-RPC API](http://codex.wordpress.org/XML-RPC_WordPress_API)).



## Installation

```
npm install wordpress
```



## Usage

```js
var wordpress = require( "wordpress" );
var client = wordpress.createClient({
	url: "my-site.com",
	username: "admin",
	password: "secret"
});

client.getPosts(function( error, posts ) {
	console.log( "Found " + posts.length + " posts!" );
});
```



## API

### Client

#### wordpress.createClient( settings )

Creates a new client instance.

* `settings`: A hash of settings that apply to all requests for the new client.
  * `username`: The username for the WordPress account.
  * `password`: The password for the WordPress account.
  * `url`: The URL for the WordPress install.
  * `host` (optional): The actual host to connect to if different from the URL, e.g., when deploying to a local server behind a firewall.
  * `blogId` (optional; default: `0`): The blog ID for the WordPress install.

#### wordpress.Client

The constructor used for client connections. Useful for creating extensions.

### Posts

#### client.getPost( id [, fields], callback )

Gets a post by ID.

* `id`: The ID of the post to get.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, post )`): A callback to invoke when the API call is complete.
  * `post`: An object containing the post data.

#### client.getPosts( [filter] [, fields], callback )

Gets all posts, optionally filtered.

* `filter` (optional): A hash of key/value pairs for filtering which posts to get.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, posts )`): A callback to invoke when the API call is complete.
  * `posts`: An array containing the posts.

#### client.newPost( data, callback )

Creates a new post.

* `data`: The data for the new post.
* `callback` (`function( error, id )`): A callback to invoke when the API call is complete.
  * `id`: The ID of the new post.

#### client.editPost( id, data, callback )

Edits an existing post.

* `id`: The ID of the post to edit.
* `data`: The data to update on the post.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

#### client.deletePost( id, callback )

Deletes a post.

*NOTE:* Deleting a pot may move it to the trash and then deleting a second time will actually delete.

* `id`: The ID of the post to delete.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

#### client.getPostType( name, callback )

Gets a post type by name.

* `name`: The name of the post type to get.
* `callback` (`function( error, postType )`): A callback to invoke when the API call is complete.
  * `postType`: An object containing the post type data.

#### client.getPostTypes( callback )

Gets all post types.

* `callback` (`function( error, postTypes )`): A callback to invoke when the API call is complete.
  * `postTypes`: An array containing the post types.

### Taxonomies

#### client.getTaxonomy( name, callback )

Gets a taxonomy by name.

* `name`: The name of the taxonomy to get.
* `callback` (`function( error, taxonomy )`): A callback to invoke when the API call is complete.
  * `taxonomy`: An object containing the taxonomy data.

#### client.getTaxonomies( callback )

Gets all taxonomies.

* `callback` (`function( error, taxonomies )`): A callback to invoke when the API call is complete.
  * `taxonomies`: An array containing the taxonomies.

#### client.getTerm( taxonomy, id, callback )

Gets a taxonomy term by ID.

* `taxonomy`: The name fo the taxonomy the term belongs to.
* `id`: The ID of the term to get.
* `callback` (`function( error, term )`): A callback to invoke when the API call is complete.
  * `term`: An object containing the taxonomy term data.

#### client.getTerms( taxonomy [, fields], callback )

Gets all taxonomy terms.

* `taxonomy`: The name fo the taxonomy the term belongs to.
* `fields` (optional): An array of fields to return.
* `callback` (`function( error, terms )`): A callback to invoke when the API call is complete.
  * `terms`: An array containing the taxonomy terms.

#### client.newTerm( data, callback )

Creates a new taxonomy term.

* `data`: The data for the new taxonomy term.
* `callback` (`function( error, id )`): A callback to invoke when the API call is complete.
  * `id`: The ID of the new taxonomy term.

#### client.editTerm( id, data, callback )

Edits an existing taxonomy term.

* `id`: The ID of the taxonomy term to edit.
* `data`: The data to update on the taxonomy.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

#### client.deleteTerm( taxonomy, id, callback )

Deletes a taxonomy term.

* `taxonomy`: The name fo the taxonomy the term belongs to.
* `id`: The ID of the taxonomy term to delete.
* `callback` (`function( error )`): A callback to invoke when the API call is complete.

### Utilities

#### client.listMethods( callback )

Gets a list of all avaialble methods.

* `callback` (`function( error, methods )`): A callback to invoke when the API call is complete.
  * `methods`: An array of methods.

#### client.call( method [, args... ], callback )

Invokes a method.

* `method`: The method to call.
* `args` (optional): Arguments to pass to the method.
* `callback` (`function( error [, data] )`): A callback to invoke when the API call is complete.
  * `data`: Data returned by the method.


#### client.authenticatedCall( method [, args... ], callback )

Invokes a method with the username and password provided by the client.

* `method`: The method to call.
* `args` (optional): Arguments to pass to the method.
* `callback` (`function( error [, data] )`): A callback to invoke when the API call is complete.
* `data`: Data returned by the method.



## License

Copyright 2014 Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).
