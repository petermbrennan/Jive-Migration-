#!/bin/bash 
#/Users/petebrennan/g5/jives-script-test/ <--path
aws s3 cp /Users/peterbrennan/g5/jive-script-test/index.html s3://jive-data-site/ --profile jive


# for file in temp3/*; do
#     echo "$("$file")"
#     aws s3 cp "$("$file")" s3://peter-jive-dump/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers 
#     rm "$( "$file")"
# done