extern crate proc_macro;
use proc_macro::TokenStream;
use proc_macro2::Ident;
use quote::quote;

use syn::parse::{Parse, ParseStream, Result};
use syn::{parse_macro_input, ItemFn, Token};

struct RouteArgs {
    client_proto: Ident,
    server_proto: Ident,
}

impl Parse for RouteArgs {
    fn parse(input: ParseStream) -> Result<Self> {
        let client_proto: Ident = input.parse()?;
        input.parse::<Token![,]>()?;
        let server_proto: Ident = input.parse()?;

        Ok(RouteArgs {
            client_proto,
            server_proto,
        })
    }
}

#[proc_macro_attribute]
pub fn mark_route(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let args = parse_macro_input!(_attr as RouteArgs);

    let input_clone = input.to_owned();
    let func = parse_macro_input!(input_clone as ItemFn);
    let func_name = func.sig.ident.to_string();

    let client_proto_name = args.client_proto.to_string();
    let server_proto_name = args.server_proto.to_string();

    println!(
        "marked route for: {} with client proto: {:#?} and server proto: {:#?}",
        func_name, client_proto_name, server_proto_name
    );

    let func_name_debug = Ident::new(&format!("{}_debug", func_name), func.sig.ident.span());
    let client_proto = args.client_proto;
    let server_proto = args.server_proto;

    let client_proto_debug = if client_proto_name == "None" {
        quote! {
            
        }
    } else {
        quote! {
            debug_assert_eq!(#client_proto::get_fully_qualified_name(), format!("Proto.{}", #client_proto_name));
        }
    };
    let server_proto_debug = if server_proto_name == "None" {
        quote! {
            
        }
    } else {
        quote! {
            debug_assert_eq!(#server_proto::get_fully_qualified_name(), format!("Proto.{}", #server_proto_name));
        }
    };

    quote! {

        #[cfg(debug_assertions)]
        fn #func_name_debug() {
            #client_proto_debug
            #server_proto_debug
        }

        #func
    }
    .into()
}

#[proc_macro_attribute]
pub fn mark_config(args: TokenStream, input: TokenStream) -> TokenStream {
    let _ = args;
    let _ = input;

    // unimplemented!()
    input
}
