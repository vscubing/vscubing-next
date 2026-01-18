#!/usr/bin/env bash
# NOTE: This script runs drizzle migrations without the migration that imports legacy data.

FILE="drizzle/0001_legacy-import.sql" 

sed -i'.bak' 's/^/-- /' $FILE
bunx drizzle-kit migrate
mv $FILE.bak $FILE
