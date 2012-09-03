$(document).ready( function() {

  var max_steps = $('.tutorial-step').length;

  // unhide the step that is indicated in the URL, or unhide the first step
  var step = window.location.hash;
  if (step) {
    $(step).show();
  } else {
    $('.tutorial-step').first().show();
  }

  // unhide the previous and hide the current step
  $('.tutorial-step .button.prev').live( 'click', function() {
    var prev_id = "#step-" + $(this).data('prev');
    $(this).closest(".tutorial-step").hide();
    $(prev_id).show();
  });

  // unhide the next and hide the current step
  $('.tutorial-step .button.next').live( 'click', function() {
    var next_id = "#step-" + $(this).data('next');
    $(this).closest(".tutorial-step").hide();
    $(next_id).show();
  });

});

