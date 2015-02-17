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
        el: '#upload-widget',
        data: {
          controlsRevealed: false,
          inProgress: false
        },
        methods: {
          revealUploadWidget: function(ev) {
            ev.preventDefault();
            this.controlsRevealed = true;
          },
          upload: function(ev) {
            ev.preventDefault();
            var syncer = this;

            syncer.inProgress = true;

            var formData = new FormData($('#upload-widget').closest('form')[0]);
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
              success: function(json) {
                var data = jQuery.parseJSON(json);
                syncer.inProgress = false;
                syncer.controlsRevealed = false;

                var input = $('#markdown-for-images');
                if( input.length == 0 ) {
                  return;
                }

                input.val(
                  input.val() + ' ' +
                  '![uploaded image](' + Libertree.frontendUploadUrlBase + '/' + data.filename + ')'
                );

                $('#upload-thumbnails').append(
                  '<img src="' + Libertree.frontendUploadUrlBase + '/' + data.thumbnail + '" alt="uploaded image"/>'
                );
              },
              error: function(data) {
                alert("Upload error: " + data.responseJSON.error);
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
