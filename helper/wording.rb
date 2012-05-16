module Ramaze
  module Helper
    module Wording
      def plural_s(n)
        n != 1  ? 's' : ''
      end

      def anded_list(array)
        if array.length < 2
          array[0].to_s
        else
          array[0..-2].join(', ') + ' and ' + array[-1]
        end
      end
    end
  end
end
