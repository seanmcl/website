#!/bin/bash
set -e -u -x -o pipefail
trap "kill 0" SIGINT SIGTERM

dir=$(readlink -f $(dirname $0))
cd $dir/..

bucket=www.seanmcl.com

# Publish javascript and index file.
if (( $# > 0 )); then
  npm run release
  aws s3 sync build s3://$bucket/build
  aws s3 cp public/prod.html s3://$bucket/index.html
fi

# Publish static content
s3cmd sync public/content s3://$bucket/
