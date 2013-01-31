var render = function( template, view ) {
	view.app_init_js = request.appInitScript;
	view.csrf_token  = request.csrfFormInput;
	
	response.writeData( Mustache.render( template, view ) );
};

var checkPermission = function( permission, success, denied ) {
	var view;
	if ( !request.sessionData || !request.sessionData.permissions ) {
		// no cookie
		response.setStatusCode( 403 );
		denied();
	} else if ( request.sessionData.permissions.indexOf(permission) != -1 ) {
		// works
		success();
	} else {
		// access denied
		response.setStatusCode( 403 );
		denied();
	}
};

