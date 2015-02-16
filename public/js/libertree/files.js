/*jslint white: true, indent: 2 */
/*global $, Libertree */

Libertree.Files = (function () {
  "use strict";

  return {
    progressHandler: function(e) {
      if(e.lengthComputable) {
        $('progress').attr({value: e.loaded, max: e.total});
      }
    },
    init: function() {
      new Vue( {
        el: 'body.upload',
        methods: {
          upload: function(ev) {
            ev.preventDefault();
            $('#upload-form progress').show();
            var syncer = this;
            var formData = new FormData($('#upload-form')[0]);
            $.ajax({
              url: '/vue-api/files',
              type: 'POST',
              xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if( myXhr.upload ) { // Check if upload property exists
                  myXhr.upload.addEventListener('progress', Libertree.Files.progressHandler, false);
                }
                return myXhr;
              },
              // Ajax events
              /* beforeSend: beforeSendHandler, */
              success: function() {
                console.log('upload success');
                $('#upload-form progress').hide();
                $('#upload-success').show();
              },
              error: function(e) {
                console.log('upload error:');
                console.log(e);
              },
              data: formData,
              // Options to tell jQuery not to process data or worry about content-type.
              cache: false,
              contentType: false,
              processData: false
            });
          }
        }
      } );
    }
  };
}());

$( function() {
  Libertree.Files.init();
} );
