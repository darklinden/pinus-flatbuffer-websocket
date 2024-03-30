FROM rust:1.76.0-alpine3.18 as builder

RUN apk upgrade --no-cache \
    && apk add --no-cache ca-certificates pkgconfig openssl-dev libc-dev alpine-sdk openssl libgcc libstdc++

WORKDIR /usr/src/app

COPY . .

RUN RUSTFLAGS="-Ctarget-feature=-crt-static" cargo build --release

FROM alpine:3.18

RUN apk add --no-cache ca-certificates openssl libgcc

COPY --from=builder /usr/src/app/target/release/rust-http /usr/local/bin/app

ENV RUST_LOG="info"
ENV ENVIRONMENT="production"
EXPOSE 3000

CMD ["/usr/local/bin/app"]
