FROM node:alpine
WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY ./config ./config
COPY ./controller ./controller
COPY ./helpers ./helpers
COPY ./middleware ./middleware
COPY ./model ./model
COPY ./public ./public
COPY ./routes ./routes
COPY ./views ./views
COPY ./app.js ./
EXPOSE 3000
CMD ["npm", "start"]