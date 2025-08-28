# ---- Build ----
FROM node:18-alpine AS build
RUN apk update && apk upgrade && apk add --no-cache bash git make build-base cmake
RUN npm install -g @nestjs/cli
ARG WORK_DIR=/var/www/node
WORKDIR ${WORK_DIR}
# copy ALL except ignored by .dockerignore
COPY . .
# install ALL node_modules, including 'devDependencies'
RUN npm i
# build
RUN npm run build
#
# ---- Release ----
FROM node:18-alpine AS release
RUN apk update && apk upgrade && apk add --no-cache bash git make build-base cmake
ARG WORK_DIR=/var/www/node
WORKDIR ${WORK_DIR}
# copy the rest of files
COPY --from=build ${WORK_DIR}/node_modules ./node_modules
COPY --from=build ${WORK_DIR}/dist ./dist
COPY --from=build ${WORK_DIR}/config ./config
COPY --from=build ${WORK_DIR}/datasource.ts ./datasource.ts
COPY --from=build ${WORK_DIR}/src/migrations ./src/migrations
COPY swagger*.json package*.json tsconfig*.json ./
COPY Makefile ./

# define CMD
CMD ["npm", "run", "start:prod"]
