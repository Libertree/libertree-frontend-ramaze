# NOTE: be sure to paste the English tutorial to all languages that have no
# translation yet. Otherwise, meaningless keys like 'tutorial-step-1' are
# shown.


## TODO: for testing purposes only
#module FastGettext
#  def self.reload!
#    FastGettext.add_text_domain('frontend', :path => 'locale', :type => :po)
#  end
#
#  def cached_find(key)
#    if key == ''
#      false
#    else
#      current_repository[key] || false
#    end
#  end
#end


module Controller
  class Intro < Base
    map '/intro'

    before_all do
      require_login
      init_locale
      # TODO: for testing purposes only
      #FastGettext.reload!
    end

    layout do |path|
      if path =~ /_post_icon/
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :splash
      end
    end

    def index
      @view = "intro"
      @all_members = Libertree::Model::Member.all.sort_by { |m| m.name_display.downcase }
      @all_members.delete(account.member)
      @list_name = s_('intro-contact-list-name|Friends')
    end

  end
end
