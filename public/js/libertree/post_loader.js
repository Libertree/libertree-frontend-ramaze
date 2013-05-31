/*jslint indent: 2, todo: true */
/*global $ */

Libertree.PostLoader = (function () {
  'use strict';

  var mkLoader = function (type) {
    var endpoint,
      loading = false;

    switch (type) {
    case 'river':
      endpoint = '/posts/_excerpts';
      break;
    case 'profile':
      endpoint = '/profiles/_more';
      break;
    case 'tags':
      endpoint = '/tags/_more';
      break;
    case 'pool':
      endpoint = '/pools/_more';
      break;
    default:
      // not supported
      return function () {};
    }

    return function (value, older_or_newer, time, onSuccess) {
      if (loading || value === undefined || value === null) { return; }

      if (older_or_newer === undefined || older_or_newer === null) {
        older_or_newer = 'older';
      }
      if (time === undefined || time === null) {
        time = $('.post-excerpt:last').data('t');
      }

      loading = true;

      // move the spinner container to the bottom of the stream
      $('#post-excerpts div.spinner').appendTo($('#post-excerpts'));
      Libertree.UI.addSpinner('#post-excerpts div.spinner', 'append');

      $.ajax({
        type: 'GET',
        url: endpoint + '/' + value + '/' + older_or_newer + '/' + time,
        success: function (html) {
          var DOMNodes = $($.trim(html)),
            excerpts = Libertree.UI.animatableNodesOnly(DOMNodes),
            container = $('<div/>');

          excerpts.css('display', 'none');

          // Remove old copies of incoming excerpts that may already be in the DOM
          // When sort order is by update/comment time, posts that are already in the DOM
          // may appear in the result set and have to be removed from the DOM.
          container.prepend(excerpts);
          container.find('.post-excerpt').each( function() {
            $('.post-excerpt[data-post-id="'+$(this).data('post-id')+'"]').remove();
          } );

          if (older_or_newer === 'newer') {
            $('#post-excerpts').prepend(excerpts);
          } else {
            $('#post-excerpts').append(excerpts);
          }
          Libertree.UI.makeTextAreasExpandable();
          excerpts.slideDown(function () {
            loading = false;
          });

          Libertree.UI.removeSpinner('#post-excerpts');

          //TODO: only process new excerpts!
          Libertree.UI.showShowMores();
          if (onSuccess) {
            onSuccess();
          }
        }
      });
    };
  };

  return {
    loadFromRiver:   mkLoader('river'),
    loadFromTags:    mkLoader('tags'),
    loadFromProfile: mkLoader('profile'),
    loadFromPool:    mkLoader('pool')
  };
}());
