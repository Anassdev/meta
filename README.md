# Assembly
[![Build Status](https://magnum.travis-ci.com/assemblymade/meta.svg?token=yfARxv3oq7ZT3ZbmJWVN&branch=master)](https://magnum.travis-ci.com/assemblymade/meta)
[![Code Climate](https://codeclimate.com/repos/53614e94e30ba048560038af/badges/2bfece8bd323b313770e/gpa.png)](https://codeclimate.com/repos/53614e94e30ba048560038af/feed)


## Dependencies

* [foreman](https://toolbelt.heroku.com)
* [ruby](http://www.ruby-lang.org)
* [PostgreSQL](http://www.postgresql.org)
* [Redis](http://redis.io/)
* [Elasticsearch](http://www.elasticsearch.org/)

## Setup

    $ bundle install

    # Edit your local configuration
    $ cp .env.sample .env && $EDITOR .env

    # Setup the database
    $ rake db:setup

    $ foreman start
