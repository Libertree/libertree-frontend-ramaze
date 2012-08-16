module Ramaze
  module Helper
    module Member
      def member_img(member, styles="avatar")
        if member.avatar_path && File.exists?(File.join(options.roots.first, options.publics.first, member.avatar_path))
          path = member.avatar_path
        else
          theme = account.theme || 'default'
          path = "/themes/#{theme}/images/avatar-default.png"
        end
        %|<img src="#{path}" class="#{styles}" alt="#{member.name_display}" title="#{member.name_display}" data-member-id="#{member.id}"/>|
      end

      def member_avatar_link(member)
        return  if member.nil?
        %|<a href="/profiles/show/#{member.id}">#{member_img(member)}</a>|
      end

      def member_name_link(member)
        return  if member.nil?
        %|<a href="/profiles/show/#{member.id}" class="member-name">#{member.name_display}</a>|
      end
    end
  end
end
