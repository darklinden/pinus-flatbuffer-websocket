# Websocket chat example

## About The Project

To make a small chat demo based on netease-pomelo protocol structure and actix Actor system.

## Built With

* [Actix] <https://github.com/actix/actix>

## Structure

* `route-marker` - route marker
  for rust does not support get function module and name in attribute macro, so I use this to mark the route and get the function name by another generater.

* `route-genertor` - route generater
  generate the route function list and write to `src/handlers/mod.rs`

* `src/main.rs` - main file
