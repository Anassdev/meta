/** @jsx React.DOM */

(function() {
  var BountyFilterButton = require('./bounty_filter_button.js.jsx')
  var TaggedInput = require('./tagged_input.js.jsx')

  var BountyFilter = React.createClass({
    getDefaultProps: function() {
      return {
        tags: [],
        filters: []
      }
    },

    addFilter: function(filter) {
      var filters = this.props.filters

      if(filter.type == 'order') {
        filters = _.reject(filters, function(f) {
          return f.type == 'order'
        })
      }

      filters = filters.concat(filter)

      filters = _.uniq(filters, function(f) {
        return JSON.stringify([f.type, f.value])
      })

      this.props.onChange(filters)
    },

    removeFilter: function(filter) {
      var filters = this.props.filters

      filters = filters.filter(function(f) {
        return f.name != filter.name || f.value != filter.value
      })

      this.props.onChange(filters)
    },

    handleFilterClick: function(filter) {
      return function(event) {
        event.preventDefault()
        this.addFilter(filter)
      }.bind(this)
    },

    filterText: function() {
      return this.props.filters.map(function(filter) {
        return [filter.type, filter.value].join(':')
      }).join(' ')
    },

    // TODO: Add a better way to generate these filter options
    renderStateFilter: function() {
      var options = [
        { name: 'Open',      value: 'open' },
        { name: 'Doing',     value: 'doing' },
        { name: 'Reviewing', value: 'reviewing' },
        { name: 'Done',      value: 'done' }
      ].map(function(option) {
        return _.extend(option, ({ type: 'state' }))
      })

      return <BountyFilterButton name={'State'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderTagFilter: function() {
      var options = this.props.tags.map(function(tag) {
        return { name: tag, value: tag }
      }).map(function(option) {
        return _.extend(option, ({ type: 'tag' }))
      })

      return <BountyFilterButton name={'Tag'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderCreatorFilter: function() {
      var options = this.props.creators.map(function(user) {
        return { name: '@' + user.username, value: user.username }
      }).map(function(option) {
        return _.extend(option, ({ type: 'creator' }))
      })

      return <BountyFilterButton name={'Creator'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderWorkerFilter: function() {
      var options = this.props.workers.map(function(user) {
        return { name: '@' + user.username, value: user.username }
      }).map(function(option) {
        return _.extend(option, ({ type: 'worker' }))
      })

      return <BountyFilterButton name={'Worker'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderOrderFilter: function() {
      var options = [
        { name: 'Priority',               value: 'priority' },
        { name: 'Most valuable',          value: 'most_valuable' },
        { name: 'Lease valuable',         value: 'least_valuable' },
        { name: 'Newest',                 value: 'newest' },
        { name: 'Oldest',                 value: 'oldest' },
        { name: 'Recently updated',       value: 'recently_updated' },
        { name: 'Least recently updated', value: 'least_recently_updated' }
      ].map(function(option) {
        return _.extend(option, ({ type: 'order' }))
      })

      return <BountyFilterButton name={'Order'} options={options} onFilterClick={this.handleFilterClick} />
    },

    render: function() {
      options = [
        { name: "I'm working on", value: 'working_on' },
        { name: "I created", value: 'created_by' },
        { name: "I commented on", value: 'commented_on' },
        { name: 'Open',      value: 'open' },
        { name: 'Doing',     value: 'doing' },
        { name: 'Reviewing', value: 'reviewing' },
        { name: 'Done',      value: 'done' }
      ]

      return (
        <div>
          <div className="bg-white rounded shadow mb2 table">
            <div className="px3 py2 table-cell border-right">
              <BountyFilterButton name={'Filter'} options={options} onFilterClick={this.handleFilterClick} />
            </div>
            <div className="px3 py2 left table-cell">
              <TaggedInput placeholder="form-control" tags={this.props.filters} onAddTag={this.addFilter} onRemoveTag={this.removeFilter} value={this.props.value} onChange={this.props.onChange} />
            </div>
          </div>
        </div>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyFilter
  }

  window.BountyFilter = BountyFilter
})();
