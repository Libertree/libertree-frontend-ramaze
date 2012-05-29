module Ramaze
  module Helper
    module Comment
      def comment_text_rendered_and_participants_linked( comment )
        s = comment.text_rendered
        i = comment.post.comments.index(comment)
        dict = {}

        commenters = comment.post.comments[0...i].map(&:member) - [comment.member]
        commenters.each do |commenter|
          name = commenter.name_display
          template = %|<a class="commenter-ref" data-member-id="#{commenter.id}" title="Click to see previous comment by #{name}">@%s</a>|

          # Mapping between possible name shortenings and the replacement strings (hyperlinks)
          [
            "@#{name}",
            '@' + name.split(/[ :,-]/, 2)[0],
          ].each do |n|
            dict[n] = template % n
            dict[n.downcase] = template % n
          end
          (2..20).each do |len|
            partial_name = name[0...len]
            dict["@#{partial_name}"] = ( template % partial_name )
            dict["@#{partial_name.downcase}"] = ( template % partial_name )
          end
        end

        # Turn possible shortenings into regexp with multiple comparisons,
        # starting with the longest.  Periods and other regexp-syntax
        # characters in display names may cause false positives, but this
        # seems not likely, so we'll take our chances and just have simpler
        # code.
        s.gsub( /#{dict.keys.sort.reverse.join('|')}/, dict )

      end
    end
  end
end
