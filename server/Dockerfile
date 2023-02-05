FROM node:18-slim AS development

RUN apt-get update && apt-get install -y procps openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install glob rimraf
RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:18-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]