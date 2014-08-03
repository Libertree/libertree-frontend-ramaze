module Controller
  class Members < Base
    map '/members'

    before_all do
      default_before_filter
    end

    layout do |path|
      case path
      when 'heartbeat'
        nil
      else
        :default
      end
    end

    provide(:json, type: 'application/json') { |action,value| value.to_json }

    def autocomplete_handle
      query = request['q'].to_s.strip
      return []  if query.empty?
      Libertree::Model::Member.search(query).map { |m|
        if m.name_display == m.handle
          selection_text = m.handle
        else
          selection_text = "#{m.name_display} (#{m.handle})"
        end

        {
          'label' => selection_text,
          'value' => m.handle
        }
      }.sort_by { |hash| hash['label'].downcase }
    end
  end
end
