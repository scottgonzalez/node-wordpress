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

*NOTE:* Deleting a post may move it to the trash and then deleting a second time will actually delete.

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

### Media

#### client.uploadFile( data, callback )

Uploads a file to Wordpress. Returns Wordpress file object, if success. Otherwise, responds with error.

* `data`: Object with file parameters
	* `name` *string*, filename. A basename for file to upload, e.g. 'hobit.jpg'. If file exists, it will be renamed to 'hobit1.jpg' if `overwrite` option is `false`, else current 'hobit.jpg' will be overwritten.
	* `type` *string*, file MIME type, e.g 'img/jpg'. Can be obtained for example with [mmmagic](https://github.com/mscdex/mmmagic).
	* `bits` *string*, binary data, see example below.
	* `overwrite` *boolean*, optional, overwrite an existing attachment of the same name.
	* `postId` *int*, optional, post ID which attachment should be assigned to. User must have permission to edit the assigned post
* `callback` (`function(err, file)`): A callback to invoke when the API call is complete.
	* `err`: An object containing error. `null` if no error occurred.
  * `file`: An object containing the file data. `null` if error occurred.

#### Example usage

```js
var fs        = require("fs");
var wordpress = require("wordpress");

client = wordpress.createClient({
  url     : "domain.com/xmlrpc.php",
  username: "admin",
  password: "mypass"
});

// sync version to be shorter. Use async if needed
var fileContentString = fs.readFileSync("/src/temp/hobbit.jpg");

// encode file string
var buffer = new Buffer(fileContentString, 'base64');

// build data object
var data = {
  name: "hobbit.jpg",
  type: "image/jpeg",
  bits: buffer
};

client.uploadFile(data, function(err, uploadedFile) {
  if (err) {
    console.log(err);
  } else {
    console.log(uploadedFile);
  }
});
```

#### Example response

```js
{ id  : '29',
  file: 'hobbit.jpg',
  url : 'http://domain.com/wp-content/uploads/2015/04/hobbit2.jpg',
  type: 'image/jpeg' }
```

## License

Copyright 2014 Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).
