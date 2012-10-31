//FIXME: src depends on selected theme
function addSpinner(target_selector, position, size) {
  $(target_selector)[position]('<img class="spinner size-'+size+'" src="/themes/default/images/spinner.gif"/>');
}
function removeSpinner(target_selector) {
  $('img.spinner', target_selector).remove();
}
