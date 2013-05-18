$(document).ready( function() {
  $(document).on('click', '.post-tools .collect', Libertree.Pools.collectHandler);
  $(document).on('click', '.post-tools .remove', Libertree.Pools.removePostHandler);

  $(document).on('click', '.create-pool-and-add-post', function(e) {
    e.preventDefault();
    var post = $(this).closest('.post, .post-excerpt');
    Libertree.Pools.createPoolAndAddPost(post);
    return false;
  } );

  $(document).on('keydown', '.pools .chzn-search input', function(event) {
    if( event.keyCode != 13 ) {
      return;
    }

    var post = $(this).closest('.post, .post-excerpt');
    Libertree.Pools.createPoolAndAddPost(post);
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
        Libertree.UI.fadingAlert( selector.data('msg') );
        selector.val('0');
        selector.trigger("liszt:updated");
      }
    );
    return false;
  } );
} );
