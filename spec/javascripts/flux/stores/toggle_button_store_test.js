jest.dontMock(pathToFile('stores/toggle_button_store.js'));

describe('ToggleButtonStore', function() {
  var ToggleButtonStore = require(pathToFile('stores/toggle_button_store.js'));
  var xhr = require(pathToFile('xhr.js'));

  it('makes a patch request', function() {
    ToggleButtonStore['toggleButton:click']('/foo');

    expect(xhr.patch.mock.calls[0][0]).toEqual('/foo');
  });
});
