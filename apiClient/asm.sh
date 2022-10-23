#!/bin/bash

ts-node --project tsconfig.json -r tsconfig-paths/register app.ts "$1" "$2" "$3" "$4" "$5" "$6" "$7"
