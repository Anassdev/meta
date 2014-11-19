//= require spec_helper
//= require underscore
//= require react
//= require components

describe('TagListStore', function() {
  before(function() {
    Dispatcher.removeAll();
  });

  afterEach(function() {
    TagListStore.removeAllTags();
  });

  it('adds a tag', function() {
    TagListStore.addTag({ tag: 'foo' });
    expect(TagListStore.getTags('bar')).to.include('foo');
  });

  it('removes a tag', function() {
    TagListStore.addTag({ tag: 'foo' });
    expect(TagListStore.getTags('bar')).to.include('foo');

    TagListStore.removeTag({ tag: 'foo' });
    expect(TagListStore.getTags('bar')).to.eql([]);
  });
});
