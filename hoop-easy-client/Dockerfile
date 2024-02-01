FROM node:18-alpine AS Production

# Set default values for environment variables
ENV NODE_ENV=production
ENV REACT_APP_APIKEY=default_value
ENV REACT_APP_APPID=default_value
ENV REACT_APP_DOMAIN=default_value
ENV REACT_APP_MEASUREMENT=default_value
ENV REACT_APP_MSI=default_value
ENV REACT_APP_PORT=default_value
ENV REACT_APP_PROJECTID=default_value
ENV REACT_APP_STORAGE=default_value

WORKDIR /app/src/hoop-easy-client

COPY package*.json ./

RUN npm install

COPY . .

# Replace default values with Railway shared variables
ARG APIKEY
ARG APPID
ARG DOMAIN
ARG MEASUREMENT
ARG MSI
ARG PORT
ARG PROJECTID
ARG STORAGE

ENV REACT_APP_APIKEY=$APIKEY
ENV REACT_APP_APPID=$APPID
ENV REACT_APP_DOMAIN=$DOMAIN
ENV REACT_APP_MEASUREMENT=$MEASUREMENT
ENV REACT_APP_MSI=$MSI
ENV REACT_APP_PORT=$PORT
ENV REACT_APP_PROJECTID=$PROJECTID
ENV REACT_APP_STORAGE=$STORAGE

RUN npm run build

CMD ["npx", "serve", "-s", "build"]
