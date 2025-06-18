#!/bin/bash

start "" bash -c "cd user-related-services && nodemon server.js"
start "" bash -c "cd friends-related-services && nodemon server.js"
start "" bash -c "cd messages-related-services && nodemon server.js"
start "" bash -c "cd gateway && nodemon server.js"
start "" bash -c "cd frontend && npm run dev"
