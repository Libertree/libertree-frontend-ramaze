module Ramaze
  module Helper
    module Wording
      # TODO: to be removed
      def plural_s(n)
        n != 1  ? 's' : ''
      end

      def anded_list(array)
        if array.length < 2
          array[0].to_s
        else
          array[0..-2].join(s_('list-comma|, ')) + s_('list-and| and ') + array[-1]
        end
      end
    end
  end
end
