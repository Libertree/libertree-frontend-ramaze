module Controller
  class Groups < Base
    map '/groups'

    before_all do
      default_before_filter
    end

    layout do |path|
      :default
    end

    def index
      @name_display = session[:name_display]
      @description = session[:description]
      @groups = Libertree::Model::Group.order(:name_display)
    end

    def create
      redirect_referrer  if ! request.post?

      begin
        group = Libertree::Model::Group.create(
          name_display: request['name_display'].to_s,
          description: request['description'].to_s,
          admin_member_id: account.member.id
        )

        session[:name_display] = nil
        session[:description] = nil

        redirect Controller::Groups.r(:show, group.id)
      rescue Sequel::CheckConstraintViolation => e
        case e.message
        when /non_empty_description/
          flash[:error] = _('Group description must be given.')
        when /non_empty_name_display/
          flash[:error] = _('Group name must be given.')
        else
          flash[:error] = _('Invalid group details given.')
        end

        session[:name_display] = request['name_display']
        session[:description] = request['description']

        redirect_referrer
      end
    end

    def show(group_id)
      @group = Libertree::Model::Group[ id: group_id.to_i ]
      if @group.nil?
        flash[:error] = _('Group not found.')
        redirect_referrer
      end

      @view = "excerpts-view group"
      @springs = account.member.springs
      @rivers = account.rivers_not_appended  # needed here?  Copied from Controller::Home

      @post_order = session[:river_post_order]   # TODO: Needs to be an instance var?  Will local do?
      @posts = @group.posts(
        viewer_account_id: account.id,
        order_by: @post_order,
        limit: 16
      )
    end

    # These are leftovers, copied from Controller::Home

    # def sort_by_time_updated_overall
      # session[:river_post_order] = :comment
      # redirect_referrer
    # end

    # def sort_by_time_created
      # session[:river_post_order] = nil
      # redirect_referrer
    # end
  end
end
