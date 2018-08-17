#!/bin/bash
clear

sed s#g5.jiveon.com/servlet/JiveServlet/showImage/#s3-us-west-2.amazonaws.com/peter-jive-dump/images/#g urls.txt > urls2.txt