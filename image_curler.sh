#!/bin/bash

clear
echo "script started"
file=$(cat urls.txt)

IFS=$',' read -d '' -r -a urls < urls.txt

clear 
char="/"
for i in "${urls[@]}"
do 
	curl -u peter.brennan@getg5.com:Tantare123 -O "$i"
	count="$(echo "$i" | awk -F"${char}" '{print NF}')"
	img="$(echo "$i" | cut -d '/' -f "${count}")"
	aws s3 cp "${img}" s3://jive-data-site/images/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --profile jive
	rm "${img}"
	
done  

#curl -u peter.brennan@getg5.com:Tantare123 -O "${urls[0]}")

# echo "${urls[0]}"
# img="$(echo "${urls[0]}" | cut -d '/' -f 8)"
# echo "${img}"


#aws s3 cp 2018-08-02_16-19-08.png s3://peter-jive-dump/images/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers 

