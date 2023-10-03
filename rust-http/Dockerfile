FROM rust:1.69.0-bullseye as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo install --path .

FROM debian:bullseye-slim
# RUN apt-get update
# RUN apt-get install -y <extra-runtime-dependencies>
# RUN rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/rust-http /usr/local/bin/app

ENV RUST_LOG="info"
ENV ENVIRONMENT="production"
EXPOSE 3000

CMD ["app"]
