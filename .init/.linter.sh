#!/bin/bash
cd /home/kavia/workspace/code-generation/daily-task-organizer-2108-2117/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

