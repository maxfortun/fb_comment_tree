#!/bin/bash -e

if [ -z "$*" ]; then
	echo "Usage: $0 <file> .. [file]"
	echo " e.g.: $0 www.facebook.com.har"
	exit 1
fi

SWD=$(cd $(dirname $0); pwd)

for har in "$@"; do
	$SWD/splitHAR.sh $har
	$SWD/entryToRes.sh hars/$har/*.entry
	$SWD/fbCommentTree.js hars/$har/*.res
done
