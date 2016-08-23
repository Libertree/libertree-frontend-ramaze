require 'fileutils'
require 'filemagic'
require 'grape'
require 'libertree/model'
require 'libertree/age'

# Dev notes:

# Grape does type coercion and type confirmation for us, so to_i, to_s etc.
# on params are not necessary.

module Libertree
  class ValidateNonEmpty < Grape::Validations::Base
    def validate_param!(attr_name, params)
      if params[attr_name].strip.empty? || Libertree.plain( params[attr_name] ).empty?
        raise(
          Grape::Exceptions::Validation,
          params: [@scope.full_name(attr_name)],
          message: "#{attr_name.inspect} cannot be empty"
        )
      end
    end
  end

  class ValidatePositiveInteger < Grape::Validations::Base
    def validate_param!(attr_name, params)
      if params[attr_name].to_i < 1
        raise(
          Grape::Exceptions::Validation,
          params: [@scope.full_name(attr_name)],
          message: "#{attr_name.inspect} must be a positive integer"
        )
      end
    end
  end

  class VueAPI < Grape::API
    format :json
    prefix 'vue-api'

    helpers do
      def set_account_from_sid # session id
        session_account = Libertree::Model::SessionAccount[cookies['innate.sid']]
        if session_account.nil?
          error! "invalid sid", 404
        end
        @account = session_account.account
      end
    end

    after_validation do
      set_account_from_sid
    end

    # ---------------------

    resource 'notifications' do
      desc "Retrieve notifications"

      params do
        optional 'n', type: Integer, default: 32, validate_positive_integer: true, desc: "the maximum number of seen notifications to return (all unseen are always returned)"
      end

      get do
        n = params['n']

        # TODO: Maybe the bodies of these "when" clauses can be moved elsewhere,
        # like presenters or something.
        notifs = ( @account.notifications.take(n).to_a + @account.notifications_unseen.to_a ).compact.uniq
        notifs.map { |notif|
          h = {
            id: notif.id,
            seen: notif.seen,
            ago: Libertree::Age.ago(notif.time_created),
          }

          case notif.subject
          when Libertree::Model::Comment
            comment = notif.subject
            account = comment.post.member.account

            h.merge!(
              type: 'comment',
              glimpse: CGI.escape_html(comment.post.glimpse),
              link: "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}",  # TODO: DRY up with Ramaze helper method comment_link
              actor: {
                id: comment.member.id,
                handle: comment.member.handle,
                nameDisplay: comment.member.name_display,
              },
              post: {
                member: {
                  accountId: account ? account.id: nil,
                  nameDisplay: comment.post.member.name_display
                }
              },
              targetIdentifier: "post-#{comment.post.id}",
              # TODO: i18n
              webNotificationText: %{#{comment.member.name_display} commented on #{comment.post.member.name_display}'s post.  "#{comment.glimpse}"}
            )
          when Libertree::Model::CommentLike
            like = notif.subject
            account = like.comment.post.member.account

            h.merge!(
              type: 'comment-like',
              glimpse: CGI.escape_html(like.comment.glimpse),
              link: "/posts/show/#{like.comment.post.id}/#{like.comment.id}#comment-#{like.comment.id}",  # TODO: DRY up with Ramaze helper method comment_link
              actor: {
                id: like.member.id,
                handle: like.member.handle,
                nameDisplay: like.member.name_display,
              },
              comment: {
                post: {
                  member: {
                    accountId: account ? account.id: nil,
                    nameDisplay: like.comment.post.member.name_display,
                  },
                },
              },
              targetIdentifier: "comment-#{like.comment.id}",
              # TODO: i18n
              webNotificationText: %{#{like.member.name_display} liked your comment ("#{like.comment.glimpse}") on #{like.comment.post.member.name_display}'s post.}
            )
          when Libertree::Model::Message
            message = notif.subject
            account = message.sender.account

            h.merge!(
              type: 'direct-message',
              glimpse: CGI.escape_html(message.glimpse),
              link: "/messages/show/#{message.id}",
              actor: {
                id: message.sender.id,
                handle: message.sender.handle,
                nameDisplay: message.sender.name_display,
              },
              message: {
                sender: {
                  accountId: account ? account.id: nil,
                  nameDisplay: message.sender.name_display
                }
              },
              targetIdentifier: "message-#{message.id}",
              # TODO: i18n
              webNotificationText: %{#{message.sender.name_display} sent you a direct message.  "#{message.glimpse}"}
            )
          when Libertree::Model::PoolPost
            pool = notif.subject.pool
            post = notif.subject.post
            account = pool.member.account

            h.merge!(
              type: 'pool-post',
              glimpse: CGI.escape_html(post.glimpse),
              poolLink: "/pools/show/#{pool.id}",
              postLink: "/posts/show/#{post.id}",
              actor: {
                id: pool.member.id,
                handle: pool.member.handle,
                nameDisplay: pool.member.name_display,
              },
              pool: {
                name: Libertree.plain(pool.name),
                member: {
                  accountId: account ? account.id: nil,
                  nameDisplay: pool.member.name_display
                }
              },
              targetIdentifier: "pool-#{pool.id}",
              # TODO: i18n
              webNotificationText: "#{pool.member.name_display} added your post to a spring called #{pool.name}."
            )
          when Libertree::Model::PostLike
            like = notif.subject
            account = like.post.member.account

            h.merge!(
              type: 'post-like',
              glimpse: CGI.escape_html(like.post.glimpse),
              link: "/posts/show/#{like.post.id}",
              actor: {
                id: like.member.id,
                handle: like.member.handle,
                nameDisplay: like.member.name_display,
              },
              post: {
                member: {
                  accountId: account ? account.id: nil,
                  nameDisplay: like.post.member.name_display
                }
              },
              targetIdentifier: "post-#{like.post.id}",
              # TODO: i18n
              webNotificationText: %{#{like.member.name_display} liked your post. "#{like.post.glimpse}"}
            )
          when Libertree::Model::Post
            post = notif.subject
            account = post.member.account
            group = post.group

            # TODO: What if a post was made to a group AND mentions the member?
            if group
              h.merge!(
                type: 'post-to-group',
                glimpse: CGI.escape_html(post.glimpse),
                postLink: "/posts/show/#{post.id}",
                groupLink: "/groups/show/#{group.id}",
                actor: {
                  id: post.member.id,
                  handle: post.member.handle,
                  nameDisplay: post.member.name_display,
                },
                post: {
                  member: {
                    accountId: account ? account.id: nil,
                    nameDisplay: post.member.name_display,
                  }
                },
                group: {
                  nameDisplay: group.name_display,
                },
                targetIdentifier: "group-#{group.id}",
                # TODO: i18n
                webNotificationText: %{#{post.member.name_display} posted to the #{group.name_display} group.  "#{post.glimpse}"}
              )
            else  # mention
              h.merge!(
                type: 'mention-in-post',
                glimpse: CGI.escape_html(post.glimpse),
                link: "/posts/show/#{post.id}",
                actor: {
                  id: post.member.id,
                  handle: post.member.handle,
                  nameDisplay: post.member.name_display,
                },
                post: {
                  member: {
                    accountId: account ? account.id: nil,
                    nameDisplay: post.member.name_display
                  }
                },
                targetIdentifier: "post-#{post.id}",
                # TODO: i18n
                webNotificationText: %{#{post.member.name_display} mentioned you in a post.  "#{post.glimpse}"}
              )
            end
          end
        }.compact
      end

      # -----------------------

      desc "Mark all notifications as seen"

      put do
        Libertree::Model::Notification.mark_seen_for_account(@account, ['all'])
      end
    end

    resource 'files' do
      desc "Add a file"
      post do
        # params['file']
        # {"filename"=>"avatar-mask.png",
        # "type"=>"application/octet-stream",
        # "name"=>"file",
        # "tempfile"=>#<File:/tmp/RackMultipart20150215-32068-1lgzih9>,
        # "head"=>
        # "Content-Disposition: form-data; name=\"file\"; filename=\"avatar-mask.png\"\r\nContent-Type: application/octet-stream\r\n"}

        if params['file'].nil?
          error! "Missing file parameter", 400
        end

        filename = params['file']['filename'].to_s
        # temp file is expected to reside in ENV['TMPDIR'] or /tmp
        temp_file = params['file']['tempfile']  # File object

        if temp_file.size > ( $conf['max_upload_bytes'] || 20*1024*1024 )
          error! "File too large", 413
        end

        content_type = nil
        FileMagic.open(FileMagic::MAGIC_MIME) do |fm|
          content_type = fm.file(temp_file.path)
        end

        # This Rack temp file should have a trustworthy name?
        sha1 = `sha1sum '#{temp_file.path}'`[/^(\S+)/, 1]
        ext = nil
        case content_type
        when 'image/gif; charset=binary'
          ext = 'gif'
        when 'image/jpeg; charset=binary'
          ext = 'jpg'
        when 'image/png; charset=binary'
          ext = 'png'
        else
          puts "Unknown file content type: #{content_type}"
          error! "Unknown file content type: #{content_type}", 415
        end
        new_name = "#{sha1}.#{ext}"

        new_path = File.expand_path( new_name, $conf['upload_dir'] )
        FileUtils.mv temp_file.path, new_path
        FileUtils.chmod "u=wr,go=r", new_path

        Libertree::Model::File.create(
          'account_id' => @account.id,
          'filename' => new_name
        )

        image = MiniMagick::Image.open(new_path)
        image.combine_options do |c|
          c.thumbnail "100x100>"
        end
        thumbnail_name = "thumbnail-#{new_name}"
        thumbnail_path = File.expand_path( thumbnail_name, $conf['upload_dir'] )
        image.write thumbnail_path
        File.chmod  0644, thumbnail_path

        {
          'filename' => new_name,
          'thumbnail' => thumbnail_name,
        }.to_json
      end

      desc "Delete a file"
      params do
        requires 'id', type: Integer, desc: "File id"
      end
      delete do
        file = Libertree::Model::File.first(
          account_id: @account.id,
          id: params['id']
        )

        if file.nil?
          error! "File not found", 404
        end

        local_path = File.expand_path( file.filename, $conf['upload_dir'] )
        FileUtils.rm local_path
        thumbnail_name = "thumbnail-#{file.filename}"
        thumbnail_path = File.expand_path( thumbnail_name, $conf['upload_dir'] )
        FileUtils.rm thumbnail_path

        file.delete
      end
    end
  end
end
