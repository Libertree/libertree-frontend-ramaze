$(document).ready( function() {
  $('.post-tools .collect').live( 'click', function(e) {
    var x = e.pageX;
    var y = e.pageY;
    $('div.pools').remove();
    var post = $(this).closest('div.post, div.post-excerpt');
    var postId = post.data('post-id');
    $.get(
      '/pools/_index/' + postId,
      function(html) {
        var o = $(html);
        o.insertAfter(post.find('.meta, .post-pane'));
        $('select#pool-selector').chosen( {
          no_results_text: "<a href='#' class='create-pool-and-add-post'>Add to a new pool</a> called"
        } ).change( function() {
          $.get(
            '/pools/add_post/' + $('select#pool-selector').val() + '/' + postId,
            function() {
              /* TODO: Check for success */
              $('div.pools').remove();
              fadingAlert('Post added to pool.', x, y);
            }
          );
        } );
      }
    );
    return false;
  } );

  $('.create-pool-and-add-post').live( 'click', function() {
    var post = $(this).closest('.post, .post-excerpt');
    var postId = post.data('post-id');
    var poolName = post.find('.pools .chzn-search input').val();
    $.get(
      '/pools/create_pool_and_add_post/'+poolName+'/'+postId,
      function(response) {
        var h = $.parseJSON(response);
        if(h.success) {
          $('.pools.window').hide();
        } else {
          alert('Failed to create pool or add post.');
        }
      }
    );
    return false;
  } );

  $('.post-tools .remove').live( 'click', function(e) {
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
    if( ! confirm('All record of collected posts will be lost.  Delete this pool?') ) {
      return false;
    }
  } );
} );
