mod utils;
use regex::Regex;
use std::{collections::HashMap, fs, path::Path};

use utils::file_util;

fn main() {
    // find all files in ../../src/handlers and generate routes
    let handlers_path_str = "../src/pinus/handlers";
    let extensions = vec!["rs"];
    let relative_path_str = "";
    let files = file_util::walk_dir(handlers_path_str, &extensions, relative_path_str).unwrap();

    let mut module_routes: HashMap<String, Vec<String>> = HashMap::new();
    let mut module_routes_proto: HashMap<String, Vec<String>> = HashMap::new();
    for file in files {
        if file == "mod.rs" {
            continue;
        }

        let file_path = Path::new(handlers_path_str).join(file.to_owned());
        let route_prefix = String::from(file.strip_suffix(".rs").unwrap());

        module_routes.insert(route_prefix.clone(), vec![]);

        let file_content = fs::read_to_string(&file_path.to_str().unwrap()).unwrap();
        let mut mark_route = false;
        let mut mark_func_str: Option<String> = None;
        let re_proto = Regex::new(r"#\[mark_route\(([\w\d]+)\W*,\W*([\w\d]+)\)").unwrap();
        let re_func_name = Regex::new(r"[\t ]([\w\d]+)\W*\(").unwrap();
        let mut v: Vec<String> = vec!["".to_string(), "".to_string()];
        for line in file_content.lines() {
            if line.contains("#[mark_route(") {
                let result = re_proto
                    .captures_iter(line)
                    .map(|cap| (cap[1].to_string(), cap[2].to_string()))
                    .collect::<Vec<_>>();
                v[0] = result[0].0.clone();
                v[1] = result[0].1.clone();
                mark_route = true;
                mark_func_str = None;
                continue;
            }
            if mark_route {
                let pre_mark_func_str = mark_func_str.clone().unwrap_or("".to_string());
                let func_str = pre_mark_func_str.trim().to_string() + line.trim();
                if func_str.contains("{") {
                    let result = re_func_name
                        .captures_iter(func_str.as_str())
                        .map(|cap| cap[1].to_string())
                        .collect::<Vec<_>>();
                    if result.len() > 0 {
                        module_routes
                            .get_mut(&route_prefix)
                            .unwrap()
                            .push(result[0].clone());
                        module_routes_proto
                            .insert(format!("{}.{}", route_prefix, result[0].clone()), v.clone());
                    }
                    mark_route = false;
                    mark_func_str = None;
                } else {
                    mark_func_str = Some(func_str);
                }
            }
        }
        module_routes.get_mut(&route_prefix).unwrap().sort();
    }

    // generate mod.rs
    let mut mod_content = String::new();
    mod_content += "use super::super::pinus::msg::Msg;\n";
    mod_content += "use anyhow::Result;\n\n";

    let mut keys = module_routes.keys().collect::<Vec<_>>();
    keys.sort();
    for module in keys.to_owned() {
        mod_content += &format!("mod {};\n", module);
    }

    mod_content += "\n";

    mod_content += "#[allow(dead_code)]\n";
    mod_content += "pub const ROUTE_LIST: &'static [&'static str] = &[\n    \"no-route\",\n";
    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            mod_content += &format!("    \"{}.{}\",\n", module, route);
        }
    }
    mod_content += "];\n\n";

    mod_content += "#[allow(dead_code)]\n";
    mod_content += "pub async fn handle_data_msg(\n";
    mod_content += "    rd: &mut redis::aio::ConnectionManager,\n";
    mod_content += "    pg: &sea_orm::DatabaseConnection,\n";
    mod_content += "    msg: Msg,\n";
    mod_content += ") -> Option<Msg> {\n";
    mod_content += "    let route_str = msg.route.to_owned().name.unwrap();\n";
    mod_content += "    let route = route_str.as_str();\n";
    mod_content += "    let result = match route {\n";

    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            let v = module_routes_proto.get(&format!("{}.{}", module, route));
            mod_content += &format!(
                "        \"{}.{}\" => {}::{}(rd, pg, msg).await, // {} {} \n",
                module,
                route,
                module,
                route,
                v.unwrap()[0],
                v.unwrap()[1]
            );
        }
    }

    mod_content += "        _ => Result::Err(anyhow::anyhow!(\"route not found\")),\n    };\n\n";

    mod_content += r###"    if result.is_err() {
        log::error!("handle_data_msg error: {:?}", result.err());
        return None;
    }

    let result = result.unwrap();
    return result;
}
"###;

    let result = fs::write("../src/pinus/handlers/mod.rs", mod_content);
    if result.is_err() {
        println!("write mod.rs error: {:?}", result.err());
    }
}
