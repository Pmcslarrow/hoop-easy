FROM node:18-alpine AS Production

ENV NODE_ENV=production
ENV REACT_APP_APIKEY=AIzaSyBmsbmk53EnltYsNE6cVrJSKJuNrPwzVnI
ENV REACT_APP_APPID=1:492922655536:web:066ca23ea0ae2ae29beef5
ENV REACT_APP_DOMAIN=hoopeasy-c7c25.firebaseapp.com
ENV REACT_APP_MEASUREMENT=G-VNCRPP69MC
ENV REACT_APP_MSI=492922655536
ENV REACT_APP_PROJECTID=hoopeasy-c7c25
ENV REACT_APP_STORAGE=hoopeasy-c7c25.appspot.com

WORKDIR /app/src/hoop-easy-client

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npx", "serve", "-s", "build"]
