module Ramaze
  module Helper
    module Cleanse
      def cleanse(s)
        return  if s.nil?
        result = Loofah::Helpers.strip_tags( s.gsub("\r\n","\n") )
        result.gsub!(/^&gt;/, '>')
        result.gsub!(/\n&gt;/, '\n>')
        result
      end
    end
  end
end
