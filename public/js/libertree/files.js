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
    Syncer: Vue.extend( {
      data: function() {
        return {
        };
      },
      methods: {
        openModal: function(ev) {
          ev.preventDefault();
          var fileId = $(ev.target).closest('div.thumbnail').data('id');
          $('.photo-full[data-id="'+fileId+'"]').modalBox({
            iconClose: true,
            iconImg: Libertree.imagesPath+'/icon-x.png',
            keyClose: true,
            bodyClose: true
          });
        },
        delete: function(ev) {
          ev.preventDefault();
          ev.stopPropagation();

          /* TODO: i18n */
          if( ! confirm("Delete this photo?") ) {
            return;
          }

          var fileId = $(ev.target).closest('div.thumbnail').data('id');

          $.ajax({
            url: '/vue-api/files',
            type: 'DELETE',
            success: function(json) {
              window.location.reload();
            },
            error: function(data) {
              alert("Deletion error: " + data.responseJSON.error);
            },
            data: {id: fileId},
          });
        },
      },
    } ),
    init: function() {
      new Vue( {
        el: '#upload-widget',
        data: {
          inProgress: false
        },
        methods: {
          revealUploadWidget: function(ev) {
            ev.preventDefault();
            $('#file-to-upload').click();
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

                if( $('#add-photos').length ) {
                  window.location.reload();
                  return;
                }

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

      $('.photo').each( function() {
        var id = $(this).attr('id');
        new Libertree.Files.Syncer({el: '#'+id});
      } );
    }
  };
}());

$( function() {
  Libertree.Files.init();
} );
