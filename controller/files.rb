module Controller
  class Files < Base
    map '/files'
    before_all do
      default_before_filter
    end

    layout do |path|
      # if path =~ %r{^_}
        # nil
      # else
        :default
      # end
    end

    def index
      @files = account.files
    end
  end
end
