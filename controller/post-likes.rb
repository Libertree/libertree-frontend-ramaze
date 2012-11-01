module Controller
  class PostLikes < Base
    map '/likes/posts'
    before_all do
      default_before_filter
    end
    layout nil

    def create(post_id)
      post = Libertree::Model::Post[ post_id.to_i ]

      if post
        # TODO: Check that the member is allowed to view and like the post.
        like = Libertree::Model::PostLike.find_or_create(
          'member_id' => account.member.id,
          'post_id'   => post.id,
        )

        # TODO: Use partial for number of likes
        return {
          'post_like_id' => like.id,
          'num_likes'    => post.likes.count,
          'liked_by'     => _('Liked by %s') % post.likes.map { |l| l.member.name_display }.join(', '),
        }.to_json
      end

      ""
    end

    def destroy(post_like_id)
      like = Libertree::Model::PostLike[ post_like_id.to_i ]
      if like && like.member == account.member
        like.delete_cascade
      end

      return {
        'num_likes'    => like.post.likes.count,
        'liked_by'     => _('Liked by %s') % like.post.likes.map { |l| l.member.name_display }.join(', '),
      }.to_json
    end
  end
end
