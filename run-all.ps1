# run-all.ps1

# Start all backend services with nodemon
Start-Process powershell -ArgumentList "cd user-related-services; nodemon server.js"
Start-Process powershell -ArgumentList "cd friends-related-services; nodemon server.js"
Start-Process powershell -ArgumentList "cd messages-related-services; nodemon server.js"
Start-Process powershell -ArgumentList "cd gateway; nodemon server.js"

# Start frontend dev server
Start-Process powershell -ArgumentList "cd frontend; npm run dev"
