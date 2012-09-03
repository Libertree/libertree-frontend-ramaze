var create_river = function(e) {
  // get river query from input field
  var query = $(e.id+' #first-river-query').val();

  // TODO: don't create river for empty query
  //       needs to return a deferred object for chaining
  if (query === "") {
    return $(e);
  }

  // TODO: check for success
  return $.post(
    '/rivers/_create_tutorial_river',
    {
      query: query
    }
  );
};

var next_step = function(step) {
  var next_id = "#step-" + $(step).find('.button.next').data('next');
  step.hide();
  $(next_id).show();
}

/*------------------------------------------*/

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

  // Execute a function (if provided).
  // Then, unhide the next and hide the current step.
  $('.tutorial-step .button.next').live( 'click', function() {
    var step = $(this).closest('.tutorial-step');
    if (step.data('func')) {
      addSpinner(this, 'after');
      $(step).find('.button').hide();
      window[step.data('func')](this).promise().done(
        function(data) {
          console.log(data);
          // remove spinner, restore buttons and advance to next step
          removeSpinner(step);
          $(step).find('.button').show();
          next_step(step);
        });
    } else {
      next_step(step);
    }
  })
});

