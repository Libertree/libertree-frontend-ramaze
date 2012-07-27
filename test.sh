#!/bin/bash
export LIBERTREE_ENV=test
bundle exec rspec -d --format nested "$@"
