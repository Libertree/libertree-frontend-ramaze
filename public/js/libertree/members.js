Vue.component('comp-member-img', {
    template: '<img v-attr="src: imgPath" alt="{{nameDisplay}}" title="{{nameDisplay}}" data-member-id="{{id}}"/>',
    inherit: true,
    replace: true,
    computed: {
      imgPath: function() {
        /* TODO: Just move this right up into the v-attr */
        return "/images/avatars/" + this.id + ".png";
      },
    }
});

Vue.component('comp-member-avatar-link', {
    template: '<a href="/profiles/show/{{id}}" title="{{nameDisplay}}"><span v-component="comp-member-img"></span></a>',
    inherit: true,
    replace: true
});
