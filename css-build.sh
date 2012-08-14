THEME="default"
[[ -n $1 ]] && THEME="$1"
bundle exec sass --update scss:public/themes/$THEME/css
