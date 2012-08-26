module Controller
  class Rivers < Base
    map '/rivers'

    before_all do
      require_login
      init_locale
    end

    layout do |path|
      if path =~ %r{\b_}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index
      @rivers = account.rivers_not_appended
      @rivers_global = account.rivers_appended
    end

    def create
      redirect_referrer  if ! request.post?

      begin
        river = Libertree::Model::River.create(
          account_id: account.id,
          label: request['label'].to_s,
          query: request['query'].to_s,
          appended_to_all: !! request['appended_to_all']
        )
      rescue PGError => e
        if e.message =~ /rivers_account_id_query_key/
          flash[:error] = _('You already have a river for that.')
          redirect_referrer
        else
          raise e
        end
      end

      if river.appended_to_all
        redirect r(:/)
      else
        redirect Home.r(:/, river.id)
      end
    end

    def destroy(river_id)
      river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ]
      if river
        river.delete_cascade
      end

      redirect_referrer
    end

    def edit(river_id)
      @river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ]
      redirect_referrer  if @river.nil?
    end

    def update(river_id)
      redirect Home.r(:/)  if ! request.post?

      @river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ]
      redirect Home.r(:/)  if @river.nil?

      @river.revise request.params

      redirect r(:/)
    end

    def ensure_exists(query, label = nil)
      river = Libertree::Model::River.find_or_create(
        account_id: account.id,
        label: label || query,
        query: query
      )

      redirect "/home/#{river.id}"
    end

    def ensure_beginner_rivers_exist
      Libertree::Model::River.ensure_beginner_rivers_for account
      redirect Home.r(:/)
    end

    def position(from_river_id, before_river_id = nil)
      rivers = account.rivers
      from_river = Libertree::Model::River[ from_river_id.to_i ]

      if from_river
        extracted = rivers.delete(from_river)
        before_river = Libertree::Model::River[ before_river_id.to_i ]

        if before_river.nil?
          rivers << extracted
        else
          rivers.insert( rivers.index(before_river), extracted )
        end

        rivers.each_with_index do |r,i|
          r.position = i
        end
      end

      redirect Home.r(:/)
    end

    def set_home(river_id)
      account.home_river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ]
      redirect_referrer
    end

    def add_from(river_id, member_id)
      river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ]
      member = Libertree::Model::Member[ member_id.to_i ]
      if river && member
        river.revise(
          'label' => river.label,
          'query' => river.query + %| :from "#{member.name_display}"|
        )
      end
      ''
    end

    def preview(query = nil)
      query ||= request['query']
      redirect_referrer  if query.nil?

      @view = 'excerpts-view'
      @query = query.to_s  # request['query'] could be non-String
      @posts = []
      Libertree::Model::Post.last(1024).each do |post|
        if Libertree::Model::River.query_components_match_post?(
          Libertree::Model::River.query_components(@query),
          post,
          account
        )
          @posts << post
          break  if @posts.count == 16
        end
      end
    end
  end
end
