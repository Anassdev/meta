#= require jquery
#= require jquery_ujs
#= require underscore
#= require backbone
#= require hogan

#= require bootstrap
#= require numeral
#= require jquery-textcomplete
#= require jquery-cookie
#= require jquery-autosize
#= require jquery-timeago
#= require react
#= require notify.js

#= require_tree ./lib

#= require_self
#= require ./main
#= require_tree ./models
#= require_tree ./collections
#= require_tree ./views
#= require ./textcomplete

class window.Application
  _.extend(@.prototype, Backbone.Events)

  setCurrentUser: (user) ->
    @_currentUser = new User(user)
    @trigger 'change:currentUser', @_currentUser
    @_currentUser

  currentUser: ->
    @_currentUser

  defaultBio: ->
    "Hi everyone! I love coding in VB6 across the stack; I'm currently living in
     Westeros. I'll ping-pong a lot between concept and design too. Hoping to
     get involved with IE6 compatibility issues, kickstarting ideas, and
     providing tangible feedback. I'd like to free up to 8-16 hours a week to
     work with everyone on this. Great to see so many people!"

  setCurrentAnalyticsProduct: (product) ->
    @_currentAnalyticsProduct = new Product(product)
    @trigger 'change:currentAnalyticsProduct', @_currentAnalyticsProduct
    @_currentAnalyticsProduct

  currentAnalyticsProduct: ->
    @_currentAnalyticsProduct

  isSignedIn: ->
    @currentUser()?

  redirectTo: (path) ->
    window.location = path
    if window.location.hash
      window.location.reload()

  formAttributes: (form) ->
    arr = $(form).serializeArray()
    _(arr).reduce (acc, field) ->
      acc[field.name] = field.value
      acc

  pluralize: (val, name)->
    if val == 1
      "#{val} #{name}"
    else
      "#{val} #{name}s"
