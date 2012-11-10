Libertree.Pools = {
  createPoolAndAddPost: function(post) {
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
          alert(h.msg);
        }
        textField.removeAttr('disabled');
      }
    );
  },

  addPost: function(poolId, postId, collect_link, x, y) {
    $.get(
      '/pools/add_post/' + poolId + '/' + postId,
      function(response) {
        var h = $.parseJSON(response);
        $('div.pools').remove();
        if(h.success) {
          collect_link.text(collect_link.data('text-success'));
          fadingAlert(h.msg, x, y);
        } else {
          alert(h.msg);
        }
      }
    );
  }

};


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
        if( o.find('option').length === 2 ) {
          var option = $('select#pool-selector option:last');
          Libertree.Pools.addPost( option.val(), postId, collect_link, x, y );
        } else {
          o.show();
          o.css( { left: (x-o.width()/2)+'px', top: (y+14)+'px' } );
          $('select#pool-selector').chosen( {
            //TRANSLATEME
            no_results_text: "<a href='#' class='create-pool-and-add-post'>Add to a new pool</a> called"
          } ).change( function() {
            Libertree.Pools.addPost( $('select#pool-selector').val(), postId, collect_link, x, y );
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
    Libertree.Pools.createPoolAndAddPost(post);
    return false;
  } );

  $('.pools .chzn-search input').live( 'keydown', function(event) {
    if( event.keyCode != 13 ) {
      return;
    }

    var post = $(this).closest('.post, .post-excerpt');
    Libertree.Pools.createPoolAndAddPost(post);
  } );

  $('.post-tools .remove').live( 'click', function(e) {
    e.preventDefault();
    var post = $(this).closest('div.post, div.post-excerpt');
    var postId = post.data('post-id');
    var poolId = $(this).data('pool-id');
    $.get(
      '/pools/_remove_post/' + poolId + '/' + postId,
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

  $('.excerpts-view.pool #river-selector').chosen().change( function() {
    var selector = $('.excerpts-view.pool #river-selector');
    var riverId = selector.val();
    var poolId = selector.data('pool-id');
    Libertree.UI.addSpinner( selector.parent(), 'append' );
    $.get(
      '/rivers/add_spring/'+riverId+'/'+poolId,
      function() {
        Libertree.UI.removeSpinner( selector.parent() );
        fadingAlert('Added to river.');
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
    return false;
  } );
} );
