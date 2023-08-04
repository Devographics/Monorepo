### Config

Sample `.env` file:

```
# General

APP_NAME=surveyform
NODE_ENV=development
API_URL=http://localhost:4020/graphql
NEXT_PUBLIC_ASSETS_URL=https://assets.devographics.com

# Email

# if needed, ask on Discord https://discord.gg/zRDb35jfrt

DEFAULT_MAIL_FROM=login@mail.stateofjs.com
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=465
SMTP_SECURE=1
SMTP_USER=xxxxx
SMTP_PASS=xxxxx
EMAIL_OCTOPUS_APIKEY=xxxxx

# MongoDB

# if needed, ask on Discord https://discord.gg/zRDb35jfrt
MONGO_PRIVATE_URI=mongodb+srv://username:password@cluster0.jat58.mongodb.net/production
MONGO_PRIVATE_DB=private_data

# Redis

# if needed, ask on Discord https://discord.gg/zRDb35jfrt
REDIS_UPSTASH_URL=https://xxx.upstash.io
REDIS_TOKEN=yyyy

# Other Config

ENCRYPTION_KEY=123xxx
SECRET_KEY=456xxx
TOKEN_SECRET=789xxx

# Local Development

LOGS_PATH=/path_to_devographics/monorepo/surveyform/.logs
# DISABLE_CACHE=true

# Next.js

__NEXT_PRIVATE_PREBUNDLED_REACT=next
ENABLE_ROUTE_HANDLERS=true
```
