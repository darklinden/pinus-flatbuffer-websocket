use proc_macro::TokenStream;
use syn::{parse_macro_input, ItemFn};

#[proc_macro_attribute]
pub fn mark_route(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let input_clone = input.to_owned();
    let func = parse_macro_input!(input_clone as ItemFn);
    let func_name = func.sig.ident.to_string();
    println!("marked route for: {}", func_name);
    input
}
