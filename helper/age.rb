module Ramaze
  module Helper
    module Age
      def ago(datetime)
        seconds_ = DateTime.now.to_time.to_i - datetime.to_time.to_i
        minutes_ = seconds_ / 60
        seconds = seconds_ % 60
        hours_ = minutes_ / 60
        minutes = minutes_ % 60
        hours = hours_ % 60
        days_ = hours_ / 24
        days = days_ % 24
        if days > 0
          "#{days} day#{plural_s(days)} ago"
        elsif hours > 0
          "#{hours} hour#{plural_s(hours)} ago"
        elsif minutes > 0
          "#{minutes} minute#{plural_s(minutes)} ago"
        else
          # "#{seconds} second#{plural_s(seconds)} ago"
          "seconds ago"
        end
      end
    end
  end
end
