module Ramaze
  module Helper
    module Comment
      def comment_link(comment)
        "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}"
      end

      def comment_text_rendered_and_participants_linked( comment, comments, account = nil )
        s = comment.text_rendered(account)
        i = comments.index(comment)
        dict = {}

        commenters = comments[0...i].map(&:member) - [comment.member]
        commenters.each do |commenter|
          name = commenter.name_display
          template = %|<a class="commenter-ref" data-member-id="#{commenter.id}" title="#{_("Click to see previous comment by %s") % ::CGI.escape_html(name)}">@%s</a>|

          # Mapping between possible name shortenings and the replacement strings (hyperlinks)
          partial_names =
            [ name, name.split(/[ :,-]/, 2)[0] ] +
            (2..[20,name.length].min).map { |len| name[0...len] }
          partial_names.each do |part|
            dict["@#{part.downcase}"] = template % part
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
