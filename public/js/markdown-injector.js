$(document).ready( function() {
  $('.markdown-injector a').live( 'click', function() {
    var textarea = $(this).closest('.markdown-injector').siblings('textarea');
    textarea.val( textarea.val() + $(this).data('markdown') );
    textarea.focus();
    return false;
  } );
} );
