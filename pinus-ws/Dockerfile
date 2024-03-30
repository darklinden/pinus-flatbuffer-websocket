FROM node-with-rust:n16.20.2-r1.76.0 as builder
 
# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY . /app

WORKDIR /app
RUN sh build.sh

FROM node:16.20.2-alpine3.18

RUN apk add --no-cache ca-certificates openssl libgcc sysstat net-tools

COPY --from=builder /app/pinus-ws/node_modules /app/node_modules
COPY --from=builder /app/pinus-ws/package.json /app/package.json
COPY --from=builder /app/pinus-ws/dist /app/dist

# EXPOSE 3010

# CMD [ "node", "/app/dist/app" ]