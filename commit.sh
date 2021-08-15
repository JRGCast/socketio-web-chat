#!/bin/bash

# Ask for commit message
clear
read -p "enter commit message: " message 
git add . 
git commit -m "Update: $message"
read -p "commited message >> Update: $message <<. Push to github? " response 
if [[ $response == "y" ]]; then
git push
else
echo "not pushing to github"
fi 
