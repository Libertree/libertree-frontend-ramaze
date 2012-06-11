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

    it 'should autolink URLs' do
      subject.render('http://nice.com').should =~ %r{<a href='http://nice.com'>http://nice.com</a>}
      subject.render('hello http://nice.com').should =~ %r{hello <a href='http://nice.com'>http://nice.com</a>}
      subject.render('This is a link:\n\nhttp://nice.com').should =~ %r{<a href='http://nice.com'>http://nice.com</a>}
    end

    it 'should not mangle underscores in URLs' do
      subject.render('http://this_is_too_cool.com').should =~ %r{this_is_too_cool}
    end

  end
end
