$(document).ready( function() {
  $('.markdown-injector a').live( 'click', function() {
    var textarea = $(this).closest('.markdown-injector').siblings('textarea');
    switch ($(this).data('markdown')) {
      case "title":
        textarea.surroundSelectedText("\n## ", "");
        break;
      case "subtitle":
        textarea.surroundSelectedText("\n### ", "");
        break;
      case "bold":
        textarea.surroundSelectedText("**", "**");
        break;
      case "italic":
        textarea.surroundSelectedText("*", "*");
        break;
      case "strike":
        textarea.surroundSelectedText("~~", "~~");
        break;
      case "url":
        textarea.surroundSelectedText("[", "](URL)");
        break;
      case "image":
        textarea.surroundSelectedText("![IMAGE TITLE](", ")");
        break;
      case "image-link":
        textarea.surroundSelectedText("[![image/photo](", ")](URL)");
        break;
      case "quote":
        textarea.surroundSelectedText("\n\n> ", "");
        break;
      case "list":
        textarea.surroundSelectedText("\n\n* ", "");
        break;
      default:
        textarea.val( textarea.val() + $(this).data('markdown') );
    }
    textarea.focus();
    return false;
  } );
} );
