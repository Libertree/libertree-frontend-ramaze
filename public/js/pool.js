function createPoolAndAddPost(post) {
  var postId = post.data('post-id');
  var textField = post.find('.pools .chzn-search input');
  textField.attr('disabled', 'disabled');
  var poolName = textField.val();
  $.get(
    '/pools/create_pool_and_add_post/'+poolName+'/'+postId,
    function(response) {
      var h = $.parseJSON(response);
      if(h.success) {
        $('.pools.window').hide();
      } else {
        alert('Failed to create pool or add post.');
      }
      textField.removeAttr('disabled');
    }
  );
}

$(document).ready( function() {
  $('.post-tools .collect').live( 'click', function(e) {
    e.preventDefault();
    if( $('.pools.window:visible').length ) {
      $('.pools.window').hide();
      return false;
    }

    var x = e.clientX;
    var y = e.clientY;
    $('div.pools').remove();
    var collect_link = $(this);
    var post = collect_link.closest('div.post, div.post-excerpt');
    var postId = post.data('post-id');
    $.get(
      '/pools/_index/' + postId,
      function(html) {
        var o = $(html);
        o.insertAfter(post.find('.meta, .post-pane'));
        if( o.find('option').length == 2 ) {
          var option = $('select#pool-selector option:last');
          $.get(
            '/pools/add_post/' + option.val() + '/' + postId,
            function() {
              /* TODO: Check for success */
              $('div.pools').remove();
              collect_link.text('collected');
              fadingAlert('Post added to "'+option.text()+'" pool.', x, y);
            }
          );
        } else {
          o.show();
          o.css( { left: (x-o.width()/2)+'px', top: (y+14)+'px' } );
          $('select#pool-selector').chosen( {
            no_results_text: "<a href='#' class='create-pool-and-add-post'>Add to a new pool</a> called"
          } ).change( function() {
            $.get(
              '/pools/add_post/' + $('select#pool-selector').val() + '/' + postId,
              function() {
                /* TODO: Check for success */
                $('div.pools').remove();
                collect_link.text('collected');
                fadingAlert('Post added to pool.', x, y);
              }
            );
          } );
        }
        $('#pool_selector_chzn a.chzn-single.chzn-default').mousedown()
      }
    );
    return false;
  } );

  $('.create-pool-and-add-post').live( 'click', function(e) {
    e.preventDefault();
    var post = $(this).closest('.post, .post-excerpt');
    createPoolAndAddPost(post);
    return false;
  } );

  $('.pools .chzn-search input').live( 'keydown', function(event) {
    if( event.keyCode != 13 ) {
      return;
    }

    var post = $(this).closest('.post, .post-excerpt');
    createPoolAndAddPost(post);
  } );

  $('.post-tools .remove').live( 'click', function(e) {
    e.preventDefault();
    var post = $(this).closest('div.post, div.post-excerpt');
    var postId = post.data('post-id');
    var poolId = $(this).data('pool-id');
    $.get(
      '/pools/remove_post/' + poolId + '/' + postId,
      function() {
        /* TODO: Check for success */
        post.slideUp(1000);
      }
    );
    return false;
  } );

  $('li.pool a.delete').click( function() {
    if( ! confirm($(this).data('msg')) ) {
      return false;
    }
  } );
} );
