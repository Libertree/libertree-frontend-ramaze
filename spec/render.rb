# encoding: utf-8

require 'redcarpet'
require_relative '../lib/libertree/render'
require_relative '../lib/libertree/markdown'

describe Libertree do
  describe '#render' do
    it 'should escape XHTML tags' do
      subject.render('<script>alert("hello world")</script>').should =~ /<p>alert\(.hello world.\)<\/p>/
    end

    it 'should not strip tags in code blocks' do
      subject.render('`<span>tag soup</span>`').should =~ /&lt;span&gt;tag soup&lt;\/span&gt;/
    end
  end
end
