var independentLabel = false;

function copyQueryToLabel() {
  if( ! independentLabel ) {
    $('.form-river input[name="label"]').val( $('.form-river input[name="query"]').val() );
  }
}

$(document).ready( function() {
  $('.form-river input[name="query"]').focus();
  if( $('.form-river input[name="query"]').val() == $('.form-river input[name="label"]').val() ) {
    $('.form-river input[name="query"]').change( copyQueryToLabel );
    $('.form-river input[name="query"]').keyup( copyQueryToLabel );
  }
  $('.form-river input[name="label"]').change( function() {
    independentLabel = true;
  } );
} );
