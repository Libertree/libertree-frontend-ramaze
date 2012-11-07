module Ramaze
  module Helper
    module Comment
      def comment_link(comment)
        "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}"
      end

      def comment_text_rendered_and_participants_linked( comment, comments )
        s = comment.text_rendered(account)
        i = comments.index(comment)
        dict = {}

        commenters = comments[0...i].map(&:member) - [comment.member]
        commenters.each do |commenter|
          name = commenter.name_display
          template = %|<a class="commenter-ref" data-member-id="#{commenter.id}" title="Click to see previous comment by #{::CGI.escape_html(name)}">@%s</a>|

          # Mapping between possible name shortenings and the replacement strings (hyperlinks)
          [
            "@#{name}",
            '@' + name.split(/[ :,-]/, 2)[0],
          ].each do |n|
            dict[n.downcase] = template % n
          end
          (2..20).each do |len|
            partial_name = name[0...len]
            dict["@#{partial_name.downcase}"] = ( template % partial_name )
          end
        end

        # Turn possible shortenings into regexp with multiple comparisons,
        # starting with the longest.
        s.gsub( /#{dict.keys.map{|k|Regexp.quote(k)}.sort.reverse.join('|')}/i ) do |m|
          dict[m.downcase]
        end
      end
    end
  end
end
