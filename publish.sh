#!/bin/bash
set -e -u -o pipefail
trap "kill 0" SIGINT SIGTERM

bucket=www.seanmcl.com
npm run release
aws s3 sync build s3://$bucket/build
aws s3 sync public/content s3://$bucket/content
aws s3 cp public/prod.html s3://$bucket/index.html
