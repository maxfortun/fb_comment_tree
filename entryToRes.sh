#!/bin/bash -e

if [ -z "$*" ]; then
	echo "Usage: $0 <file> .. [file]"
	echo " e.g.: $0 hars/www.facebook.com.har/*.entry"
	exit 1
fi

for file in "$@"; do
	echo -en "\033[0K\r$file" >&2
	jq -r '.response.content.text' $file > $file.res
done
echo


