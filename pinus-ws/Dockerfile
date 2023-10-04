FROM darklinden/node-with-rust:n16.20.2-r1.69.0 as builder
 
# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY . /app/pinus-ws 
COPY ./dependencies/proto /app/proto
COPY ./dependencies/route /app/route
COPY ./dependencies/jwt /app/jwt
COPY ./dependencies/flatbuffers-js /app/flatbuffers-js

WORKDIR /app/flatbuffers-js
RUN yarn install
RUN yarn build
RUN rm -rf node_modules

WORKDIR /app/jwt/napi-jwt
RUN yarn install
RUN yarn build
RUN rm -rf node_modules
RUN rm -rf target

WORKDIR /app/pinus-ws
RUN sh build-deps.sh
RUN yarn prisma generate
RUN yarn build

FROM node:16.20.2-bullseye-slim

COPY --from=builder /app/pinus-ws/node_modules /app/node_modules
COPY --from=builder /app/pinus-ws/package.json /app/package.json
COPY --from=builder /app/pinus-ws/dist /app/dist

EXPOSE 3010

CMD [ "node", "/app/dist/app" ]