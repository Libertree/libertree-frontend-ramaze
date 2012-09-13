var Tutorial = {
  /* step 2 --------------------------------------------------*/
  create_river: function(e) {
    // get river query from input field
    var query = $(e.id+' #first-river-query').val();

    // don't create river for empty query
    if (query === "") {
      return {'status': 'error', 'msg': 'text field cannot be empty'};
    }

    // TODO: check for success
    return $.post(
      '/rivers/_create_tutorial_river',
      { query: query }
    );
  },

  /* step 3 --------------------------------------------------*/
  add_rivers_from_list: function(e) {
    // TODO: there's probably a better way to get the values of
    //       selected input fields.
    var selected = $(e.id + ' input').map(
        function(i,e) {
          if ($(e).prop('checked')) { return $(e).val();}
        }).join();

    // don't make a request if nothing is selected
    if (selected === "") {
      return {'status':'success'};
    }

    // TODO: check for success
    return $.post(
      '/rivers/_create_default_rivers',
      { ids: selected }
    );
  },


  /* all steps -----------------------------------------------*/
  next_step: function(step) {
    var next_id = "#step-" + $(step).find('.button.next').data('next');
    step.hide();
    $(next_id).show();
    window.location = next_id;
  },

  restore_step: function(step) {
    removeSpinner(step);
    $(step).find('.button').show();
  },

  // observe a function's return value
  evaluate_response: function(result, step) {
    if(result['status'] === 'success') {
      this.next_step(step);
    } else {
      // TODO: display error
      console.log(result['msg']);
    }
    this.restore_step(step);
  },
};


/*------------------------------------------*/

$(document).ready( function() {

  var max_steps = $('.tutorial-step').length;

  // unhide the step that is indicated in the URL, or unhide the first step
  // TODO: show and hide steps when the hash in the location changes

  var step = window.location.hash;
  if (step) {
    $(step).show();
  } else {
    $('.tutorial-step').first().show();
  }

  // bootstrap popovers for additional information
  $("a[rel=popover]")
    .popover()
    .click(function(e) {
      e.preventDefault()
    })

  // unhide the previous and hide the current step
  $('.tutorial-step .button.prev').live( 'click', function() {
    var prev_id = "#step-" + $(this).data('prev');
    $(this).closest(".tutorial-step").hide();
    $(prev_id).show();
  });

  // Execute a function (if provided).
  // Then, unhide the next and hide the current step.
  $('.tutorial-step .button.next').live( 'click', function(event) {
    event.preventDefault();

    var step = $(this).closest('.tutorial-step');

    // execute function if provided
    if (step.data('func')) {
      addSpinner(this, 'after');
      $(step).find('.button').hide();
      // TODO: first check if the function is defined
      var result = Tutorial[step.data('func')](this);

      // If the return value is evaluated asynchronously, wait for it
      // TODO: is there a better way to find out if this object supports ".promise()"?
      // TODO: I don't like this. Pass the function to a handler that does all of this instead?
      if (jQuery.type(result['promise']) === "function") {
        result.promise().done(
          function() {
            Tutorial.evaluate_response(result, step);
          });
      } else {
        Tutorial.evaluate_response(result, step);
      }
    } else {
      Tutorial.next_step(step);
    }
  })
});

