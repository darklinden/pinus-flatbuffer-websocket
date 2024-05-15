#!/usr/bin/env cargo-eval
//! Dependencies can be specified in the script file itself as follows:
//!
//! ```cargo
//! [dependencies]
//! anyhow = { version = "1.0.75", features = ["backtrace"] }
//! regex = "1.10.2"
//! heck = "0.5.0"
//! ```

use anyhow::Result;
use heck::ToSnakeCase;
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
    let dir_content = fs::read_dir(dir)?.collect::<Result<Vec<_>, _>>()?;
    let dir_content = dir_content.iter().map(|entry| entry.path());

    for entry_path in dir_content {
        let metadata = fs::metadata(&entry_path)?;
        if metadata.is_dir() {
            walk_dir(root_path, extensions, entry_path.to_str().unwrap())?
                .iter()
                .for_each(|f| files.push(f.to_string()));
        } else {
            let should_add = if extensions.is_empty() {
                true
            } else {
                match Path::extension(entry_path.as_path()) {
                    None => false,
                    Some(ext) => extensions.contains(&ext.to_str().unwrap()),
                }
            };

            if should_add {
                files.push(String::from(
                    entry_path
                        .strip_prefix(root_path.to_str().unwrap())?
                        .to_str()
                        .unwrap(),
                ));
            }
        }
    }
    Ok(files)
}

fn work() -> Result<()> {
    let cwd = std::env::current_dir()?;

    let configs_bytes_path = cwd.parent().unwrap().join("configs/src/db");
    println!("finding route marks in: {:?}", configs_bytes_path);

    let extensions = vec!["rs"];
    let relative_path_str = "";
    let files = walk_dir(&configs_bytes_path, &extensions, relative_path_str)?;

    // find all modules and Data struct
    let mut mod_list: Vec<String> = Vec::new();
    let mut mod_data: HashMap<String, String> = HashMap::new();

    for file in files {
        if file == "mod.rs" {
            continue;
        }

        println!("");
        println!("processing file: {:?}", file);

        let file_path = configs_bytes_path.join(file.to_owned());
        let file_base_name = file_path.file_name().unwrap().to_str().unwrap();
        let mod_name = String::from(file_base_name.strip_suffix(".rs").unwrap());

        mod_list.push(mod_name.clone());

        let file_content = fs::read_to_string(&file_path.to_str().unwrap())?;
        let mut mark_config = false;
        let re_struct_name = Regex::new(r"pub struct ([\w\d]+) \{")?;
        for (index, line) in file_content.lines().enumerate() {
            if line.contains("#[mark_config]") || line.contains("#[macro_markers::mark_config]") {
                mark_config = true;
                println!("mark_config at line: [{}]", index);
                continue;
            }
            if mark_config {
                let result = re_struct_name
                    .captures_iter(line.trim())
                    .map(|cap| cap[1].to_string())
                    .collect::<Vec<_>>();

                if !result.is_empty() {
                    println!("found Data struct: [{}] {:?}", index, result[0]);
                    mod_data.insert(mod_name, result[0].clone());
                    break;
                }
            }
        }
    }

    println!("\nmod_data: {:#?}", mod_data);

    mod_list.sort();

    // generate mod.rs
    println!("\ngenerating mod.rs");

    let mut mod_content = String::new();
    mod_content += "// @generated\n";
    mod_content += "#![allow(dead_code)]\n\n";

    // mod xxx;
    for module in mod_list.iter() {
        mod_content += &format!("pub mod {};\n", module);
    }

    mod_content += "\n";

    // pub fn get_data
    mod_content += "#[derive(Debug, Clone)]\n";
    mod_content += "pub struct DBConfigsData {\n";
    for module in mod_list.iter() {
        if let Some(data_struct) = mod_data.get(module) {
            mod_content += &format!(
                "    pub {}: {}::{},\n",
                data_struct.to_snake_case().to_lowercase(),
                module,
                data_struct
            );
        }
    }

    mod_content += "}\n\n";

    mod_content += "impl DBConfigsData {\n";
    mod_content +=
        "    pub async fn load_all(pg: &sea_orm::DatabaseConnection) -> anyhow::Result<Self> {\n";

    for module in mod_list.iter() {
        if let Some(data_struct) = mod_data.get(module) {
            mod_content += &format!(
                "        let {} = {}::{}::load_data(pg);\n",
                data_struct.to_snake_case().to_lowercase(),
                module,
                data_struct
            );
        }
    }

    // tokio::join!(...)
    mod_content += "        let (\n";
    for module in mod_list.iter() {
        if let Some(data_struct) = mod_data.get(module) {
            mod_content += &format!(
                "            {},\n",
                data_struct.to_snake_case().to_lowercase(),
            );
        }
    }
    mod_content += "        ) = tokio::join!(\n";
    for module in mod_list.iter() {
        if let Some(data_struct) = mod_data.get(module) {
            mod_content += &format!(
                "            {},\n",
                data_struct.to_snake_case().to_lowercase(),
            );
        }
    }
    mod_content += "        );\n";

    mod_content += "        Ok(Self {\n";
    for module in mod_list.iter() {
        if let Some(data_struct) = mod_data.get(module) {
            mod_content += &format!(
                "            {}: {}?,\n",
                data_struct.to_snake_case().to_lowercase(),
                data_struct.to_snake_case().to_lowercase(),
            );
        }
    }
    mod_content += "        })\n";

    mod_content += "    }\n";
    mod_content += "}\n";

    let mod_file_path = configs_bytes_path.join("mod.rs");
    fs::write(mod_file_path, mod_content)?;

    println!("\nDone!");

    Ok(())
}

fn main() {
    let result = work();
    if let Err(e) = result {
        eprintln!("Error: {:?}", e);
    }
}
