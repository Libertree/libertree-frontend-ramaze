module Libertree
  class Markdown < Redcarpet::Render::HTML
    include Redcarpet::Render::SmartyPants
  end
end
