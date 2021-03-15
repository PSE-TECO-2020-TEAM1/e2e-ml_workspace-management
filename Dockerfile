FROM node:15
WORKDIR /srv
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
CMD [ "npm", "run", "build-run" ]
EXPOSE 3000