module Ramaze
  module Helper
    module Member
      def member_img(member, styles="avatar")
        if File.exists? File.join(options.roots.first, options.publics.first, member.avatar_path)
          path = member.avatar_path
        else
          path = '/images/avatar-default.png'
        end
        %|<img src="#{path}" class="#{styles}" alt="#{member.name_display}"/>|
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
