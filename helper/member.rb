module Ramaze
  module Helper
    module Member
      def member_img(member, styles="avatar")
        path = "/images/avatars/#{member.id}.png"
        if ! File.exists?(File.join(options.roots.first, options.publics.first, path))
          path = "/themes/#{current_theme}/images/avatar-default.png"
        end
        %|<img src="#{path}" class="#{styles}" alt="#{member.name_display}" title="#{member.name_display}" data-member-id="#{member.id}"/>|
      end

      def member_avatar_link(member)
        return  if member.nil?
        %|<a href="/profiles/show/#{member.id}" title="#{member.name_display}">#{member_img(member)}</a>|
      end

      def member_name_link(member)
        return  if member.nil?
        %|<a href="/profiles/show/#{member.id}" class="member-name" title="#{member.handle}">#{member.name_display}</a>|
      end
    end
  end
end
