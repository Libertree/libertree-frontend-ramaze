var Tutorial = {
  currentStep: function(that) {
    return $(that).closest('.tutorial-step');
  },

  /* step 2 --------------------------------------------------*/
  createRiver: function(that) {
    // get river query from input field
    var query = $(that.id+' #first-river-query').val();

    // don't create river for empty query
    if (query === "") {
      return {'status': 'skip'};
    }

    return $.post(
      '/rivers/_create_tutorial_river',
      { query: query }
    );
  },

  /* step 3 --------------------------------------------------*/
  addRiversFromList: function(that) {
    var step = Tutorial.currentStep(that);
    var rivers = $(step).find('input').map(
      function(i,e) {
        if ($(e).prop('checked')) {
          return {
            'query': $(e).data('query'),
            'label': $(e).data('label')
          };
        }
      }
    ).get();

    // don't make a request if nothing is selected
    if (rivers == "") {
      return {'status':'success'};
    }

    return $.post(
      '/rivers/_create_default_rivers',
      { rivers: rivers }
    );
  },

  /* step 4 --------------------------------------------------*/
  createContactList: function(that) {
    var step = Tutorial.currentStep(that);
    var members = $(that.id+' #contact-list-members').val();

    // don't create contact list if no members specified
    if( members === null ) {
      return {'status': 'skip'};
    }

    console.log(members);

    return $.post(
      '/contact-lists/create.json',
      {
        name: $(step).data('name'),
        members: members,
        intro: true
      }
    );
  },


  /* all steps -----------------------------------------------*/
  nextStep: function(step) {
    // clear errors
    var errorContainer = $(step).find('.error');
    if (errorContainer) {
      errorContainer.html("");
    }

    // show next step
    var next_id = "#step-" + $(step).find('.button.next').data('next');
    step.hide();
    $(next_id).show();
    window.location = next_id;
  },

  restoreStep: function(step) {
    Libertree.UI.removeSpinner(step);
    $(step).find('.button').show();
  },

  forward: function(step, element) {
    if ($(element).data('next') === undefined) {
      window.location = $(element).prop('href');
    } else {
      this.nextStep(step);
    }
  },

  // observe a function's return value
  evaluateResponse: function(result, step, that) {
    // interpret result as object
    if (typeof(result) === 'object' && result.responseText) {
      var result = JSON.parse(result.responseText);
    }

    // success?
    if(result.status === 'success') {
      // display success message in next step if defined
      var message = $(step).data('success');
      if (message !== undefined && message !== "") {
        $(step).next().find('h1').after("<p class='message'>"+message+"</p>");
      }
      this.forward(step, that);
    } else if (result.status === 'skip') {
      this.forward(step, that);
    } else {
      // display errors
      var errorContainer = $(step).find('.errors');
      if (errorContainer) {
        errorContainer.html(result['msg']);
      } else {
        console.log(result['msg']);
      }
    }
    this.restoreStep(step);
  },
};


/*------------------------------------------*/

$(document).ready( function() {

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
    .click(function() {
      return false;
    })
  $(document).click( function() {
    // hide all popovers
    $("a[rel=popover]").popover('hide');
  })

  // unhide the previous and hide the current step
  $('.tutorial-step .button.prev').live( 'click', function() {
    var prev_id = "#step-" + $(this).data('prev');
    Tutorial.currentStep(this).hide();
    $(prev_id).show();
  });

  // go to next step without executing functions
  $('.tutorial-step .button.skip').live( 'click', function(event) {
    event.preventDefault();
    var step = Tutorial.currentStep(this);
    Tutorial.nextStep(step);
  });

  // Execute a function (if provided).
  // Then, unhide the next and hide the current step.
  $('.tutorial-step .button.next').live( 'click', function(event) {
    event.preventDefault();

    var step = Tutorial.currentStep(this);
    var that = this;

    // execute function if provided and valid
    if (step.data('func') && Tutorial[step.data('func')] !== undefined) {
      Libertree.UI.addSpinner(this, 'after');
      $(step).find('.button').hide();

      // execute specified function
      var result = Tutorial[step.data('func')](this);

      // If the return value is evaluated asynchronously, wait for it
      // TODO: is there a better way to find out if this object supports ".promise()"?
      // TODO: I don't like this. Pass the function to a handler that does all of this instead?
      if (jQuery.type(result['promise']) === "function") {
        result.promise().done(
          function() {
            Tutorial.evaluateResponse(result, step, that);
          });
      } else {
        Tutorial.evaluateResponse(result, step, that);
      }
    } else {
      // end tutorial or move on to next step
      Tutorial.forward(step, that);
    }
  })
});
