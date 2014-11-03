module Ramaze
  module Helper
    module Age
      def ago(datetime)
        Libertree::Age.ago datetime
      end
    end
  end
end
