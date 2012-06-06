module Ramaze
  module Helper
    module Age
      def ago(datetime)
        total_seconds = DateTime.now.to_time.to_i - datetime.to_time.to_i
        total_minutes = total_seconds / 60
        display_seconds = total_seconds % 60
        total_hours = total_minutes / 60
        display_minutes = total_minutes % 60
        display_hours = total_hours % 60
        total_days = total_hours / 24
        display_days = total_days % 24

        if display_days > 0
          "#{display_days} day#{plural_s(display_days)} ago"
        elsif display_hours > 0
          "#{display_hours} hour#{plural_s(display_hours)} ago"
        elsif display_minutes > 0
          "#{display_minutes} minute#{plural_s(display_minutes)} ago"
        else
          # "#{display_seconds} second#{plural_s(display_seconds)} ago"
          "seconds ago"
        end
      end
    end
  end
end
