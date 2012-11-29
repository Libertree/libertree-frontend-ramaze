Libertree.Session = {
  ensureAlive: function(html) {
    if( $(html).find('#login').length > 0 ) {
      window.location = '/login';
      return false;
    }
  }
};
