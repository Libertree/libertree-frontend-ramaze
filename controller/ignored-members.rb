module Controller
  class IgnoredMembers < Base
    map '/ignored_members'
    before_all do
      default_before_filter
    end

    layout :default

    def index
      @ignored_members = account.ignored_members
    end

    def add
      if request.post?
        member_handle = request['member_handle'].to_s.gsub(/^@/, '')
        member = Libertree::Model::Member.with_handle(member_handle)
        account.ignore_member(member)
      end
      redirect_referrer
    end

    def delete(member_id)
      member = Libertree::Model::Member[member_id.to_i]
      account.unignore_member(member)
      redirect_referrer
    end
  end
end
