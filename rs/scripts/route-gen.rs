#!/usr/bin/env cargo-eval
//! Dependencies can be specified in the script file itself as follows:
//!
//! ```cargo
//! [dependencies]
//! anyhow = { version = "1.0.75", features = ["backtrace"] }
//! heck = "0.5.0"
//! regex = "1.10.2"
//! ```

use anyhow::{Ok, Result};
use heck::{ToSnakeCase, ToUpperCamelCase};
use regex::Regex;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub fn walk_dir(
    root_path: &Path,
    extensions: &Vec<&str>,
    relative_path_str: &str,
) -> Result<Vec<String>> {
    let mut files: Vec<String> = vec![];
    let dir = root_path.join(relative_path_str);
    let dir_content = fs::read_dir(dir)
        .unwrap()
        .map(|e| e.unwrap().path())
        .collect::<Vec<_>>();

    for entry_path in dir_content {
        let metadata = fs::metadata(&entry_path).unwrap();
        if metadata.is_dir() {
            walk_dir(root_path, extensions, entry_path.to_str().unwrap())?
                .iter()
                .for_each(|f| files.push(f.to_string()));
        } else {
            let mut should_add = false;

            if extensions.len() <= 0 {
                should_add = true;
            } else {
                let ext = Path::extension(entry_path.as_path())
                    .unwrap()
                    .to_str()
                    .unwrap();
                if extensions.contains(&ext) {
                    should_add = true;
                }
            }

            if should_add {
                files.push(String::from(
                    entry_path
                        .strip_prefix(root_path.to_str().unwrap())
                        .unwrap()
                        .to_str()
                        .unwrap(),
                ));
            }
        }
    }
    Ok(files)
}

fn main() {
    let cwd = std::env::current_dir().unwrap();

    let handlers_path = cwd.parent().unwrap().join("server-ws/src/handlers");
    println!("finding route marks in: {:?}", handlers_path);

    let extensions = vec!["rs"];
    let relative_path_str = "";
    let files = walk_dir(&handlers_path, &extensions, relative_path_str).unwrap();

    let mut module_routes: HashMap<String, Vec<String>> = HashMap::new();
    let mut module_routes_proto: HashMap<String, Vec<String>> = HashMap::new();
    for file in files {
        if file == "mod.rs" {
            continue;
        }

        println!("");
        println!("processing file: {:?}", file);

        let file_path = handlers_path.join(file.to_owned());
        let file_base_name = file_path.file_name().unwrap().to_str().unwrap();
        let route_prefix = String::from(file_base_name.strip_suffix(".rs").unwrap());

        module_routes.insert(route_prefix.clone(), vec![]);

        let file_content = fs::read_to_string(&file_path.to_str().unwrap()).unwrap();
        let mut mark_route = false;
        let mut mark_func_str: Option<String> = None;
        let re_proto =
            Regex::new(r"#\[(macro-markers::mark_route|mark_route)\(([\w\d]+)\W*,\W*([\w\d]+)\)")
                .unwrap();
        let re_func_name = Regex::new(r"[\t ]([\w\d]+)\W*\(").unwrap();
        let mut v: Vec<String> = vec!["".to_string(), "".to_string()];
        for line in file_content.lines() {
            if line.contains("#[mark_route(") || line.contains("#[macro-markers::mark_route(") {
                let result = re_proto
                    .captures_iter(line)
                    .map(|cap| (cap[2].to_string(), cap[3].to_string()))
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

                        println!(
                            "found route: [{}.{}] client proto: {} server proto: {}",
                            &route_prefix, &result[0], &v[0], &v[1]
                        );
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
    println!("\ngenerating mod.rs");

    let mut mod_content = String::new();
    mod_content += "// @generated\n";
    mod_content += "#![allow(dead_code)]\n";
    mod_content += "use anyhow::Result;\n\n";
    mod_content += "use super::pinus::{msg::Msg, msg::Route};\n";
    mod_content += "use crate::session::WsSessionData;\n\n";

    // mod xxx;
    let mut keys = module_routes.keys().collect::<Vec<_>>();
    keys.sort();
    for module in keys.to_owned() {
        mod_content += &format!("mod {};\n", module);
    }

    mod_content += "\n";

    // pub const XXX: &str = "xxx";
    mod_content += "pub const NO_ROUTE: &str = \"no-route\";\n";
    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            let route_name = format!("{}_{}", module, route)
                .to_snake_case()
                .to_uppercase();
            mod_content += &format!(
                "pub const {}: &str = \"{}.{}\";\n",
                route_name, module, route
            );
        }
    }

    mod_content += "\n";

    // pub const ROUTE_LIST: &[&str] = &[];
    mod_content += "#[allow(dead_code)]\n";
    mod_content += "pub const ROUTE_LIST: &[&str] = &[\n";
    mod_content += "    NO_ROUTE,\n";
    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            mod_content += &format!(
                "    {},\n",
                format!("{}_{}", module, route)
                    .to_snake_case()
                    .to_uppercase()
            );
        }
    }
    mod_content += "];\n\n";

    // const route code
    let mut route_code: u16 = 0;
    // pub const ROUTE_NO_ROUTE_CODE: u16 = 0;
    mod_content += "pub const CODE_NO_ROUTE: u16 = 0;\n";
    route_code += 1;
    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            mod_content += &format!(
                "pub const {}: u16 = {};\n",
                format!("CODE_{}_{}", module, route)
                    .to_snake_case()
                    .to_uppercase(),
                route_code
            );
            route_code += 1;
        }
    }

    mod_content += "\n";

    // const route
    route_code = 1;
    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            let route_name = format!("{}_{}", module, route)
                .to_snake_case()
                .to_uppercase();

            mod_content += &format!(
                "pub const ROUTE_{}: Route = Route::from(CODE_{});\n",
                route_name, route_name
            );
            route_code += 1;
        }
    }

    mod_content += "\n";

    // fn route_name_to_code
    mod_content += "#[allow(dead_code)]\n";
    mod_content += "pub fn route_name_to_code(route: &str) -> u16 {\n";
    mod_content += "    for (index, item) in ROUTE_LIST.iter().enumerate() {\n";
    mod_content += "        if item == &route {\n";
    mod_content += "            return index as u16;\n";
    mod_content += "        }\n";
    mod_content += "    }\n";
    mod_content += "    CODE_NO_ROUTE\n";
    mod_content += "}\n\n";

    // fn route_code_to_name
    mod_content += "\n";
    mod_content += "#[allow(dead_code)]\n";
    mod_content += "pub fn route_code_to_name(code: u16) -> &'static str {\n";
    mod_content += "    if code < ROUTE_LIST.len() as u16 {\n";
    mod_content += "        return ROUTE_LIST[code as usize];\n";
    mod_content += "    }\n";
    mod_content += "    NO_ROUTE\n";
    mod_content += "}\n\n";

    //
    mod_content += "#[rustfmt::skip]\n";
    mod_content += "#[allow(dead_code)]\n";
    mod_content += "pub async fn handle_data_msg(session_data: &WsSessionData, msg: Msg) -> Result<Option<Msg>> {\n";
    mod_content += "    let route_code = msg.route.to_owned().code.unwrap_or(0);\n";
    mod_content += "    match route_code {\n";

    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            let v = module_routes_proto.get(&format!("{}.{}", module, route));
            let route_code = format!("CODE_{}_{}", module, route)
                .to_snake_case()
                .to_uppercase();
            mod_content += &format!(
                "        {} => {}::{}(session_data, msg).await, // {} {} \n",
                route_code,
                module,
                route,
                v.unwrap()[0],
                v.unwrap()[1]
            );
        }
    }

    mod_content += r###"        _ => Err(anyhow::anyhow!("route not found")),
        }
    }
    "###;

    let result = fs::write(handlers_path.join("mod.rs"), mod_content);
    if result.is_err() {
        panic!("write mod.rs error: {:?}", result.err());
    }

    // generate GameRoute.cs
    /*
    public class Home : RouteBase {
        public Cmd PlayerQueryAchievementList = new Cmd("connector.achievementHandler.playerQueryAchievementList", typeof(Proto.QueryPlayerAchievements), typeof(Proto.ResponsePlayerAchievements));
    }
     */

    println!("\ngenerating GameRoute.cs");
    let mut game_route_content = String::new();
    game_route_content += "\n";
    game_route_content += "public class GameRoute : RouteBase {\n";

    for module in keys.to_owned() {
        let routes = module_routes.get(module).unwrap();
        for route in routes {
            let v = module_routes_proto.get(&format!("{}.{}", module, route));
            if v.is_none() {
                panic!("module_routes_proto not found: {}.{}", module, route);
            }
            let v = v.unwrap();
            let client_proto = &v[0];
            let server_proto = &v[1];

            let client_proto = if client_proto == "None" {
                "null".to_string()
            } else {
                format!("typeof(Proto.{})", client_proto)
            };
            let server_proto = if server_proto == "None" {
                "null".to_string()
            } else {
                format!("typeof(Proto.{})", server_proto)
            };

            let route_name = format!("{}_{}", module, route).to_upper_camel_case();

            game_route_content += &format!(
                "    public Cmd {} = new Cmd(\"{}\", {}, {});\n",
                route_name,
                format!("{}.{}", module, route),
                client_proto,
                server_proto
            );
        }
    }

    game_route_content += "}\n";

    let generated_folder = cwd.join("route-generated");
    if !generated_folder.exists() {
        fs::create_dir_all(&generated_folder).unwrap();
    }

    let csharp_file = generated_folder.join("GameRoute.cs");

    let result = fs::write(csharp_file, game_route_content);
    if result.is_err() {
        panic!("write GameRoute.cs error: {:?}", result.err());
    }

    println!("\nDone!");
}
