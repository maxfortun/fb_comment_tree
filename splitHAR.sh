#!/bin/bash -e

if [ -z "$*" ]; then
	echo "Usage: $0 <file> .. [file]"
	echo " e.g.: $0 www.facebook.com.har"
	exit 1
fi

WD=${WD:-$PWD}

for har in "$@"; do
	har_dir=$WD/hars/$har
	[ ! -d $har_dir ] || rm -rf $har_dir
	mkdir -p $har_dir
	i=0
	while read -r line; do
		entry=$har_dir/$i.entry
		echo "$line" > $entry
		echo -en "\033[0K\r$entry" >&2
		i=$((i+1))
	done < <(jq -c '.log.entries[]' $har)
	echo  >&2
done
