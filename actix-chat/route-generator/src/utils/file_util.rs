use anyhow::{Ok, Result};
use std::fs;
use std::path::Path;

#[allow(dead_code)]
pub fn file_md5(file_path: &str) -> Result<String> {
    let file = Path::new(file_path);
    let hash = sha256::try_digest(file).unwrap();
    Ok(hash)
}

#[allow(dead_code)]
pub fn file_exist(file_path: &str) -> bool {
    std::path::Path::new(file_path).exists()
}

#[allow(dead_code)]
pub fn file_equal(file_path1: &str, file_path2: &str) -> Result<bool> {
    let exist1 = file_exist(file_path1);
    let exist2 = file_exist(file_path2);
    if exist1 != exist2 {
        return Ok(false);
    }
    if !exist1 && !exist2 {
        return Ok(true);
    }

    let md5_1 = file_md5(file_path1).unwrap();
    let md5_2 = file_md5(file_path2).unwrap();
    Ok(md5_1 == md5_2)
}

#[allow(dead_code)]
pub fn walk_dir(
    root_path_str: &str,
    extensions: &Vec<&str>,
    relative_path_str: &str,
) -> Result<Vec<String>> {
    // find all files in ../../src/handlers
    let mut files: Vec<String> = vec![];
    let dir = Path::new(root_path_str).join(relative_path_str);
    let dir_content = fs::read_dir(dir)
        .unwrap()
        .map(|e| e.unwrap().path())
        .collect::<Vec<_>>();

    for entry_path in dir_content {
        let metadata = fs::metadata(&entry_path).unwrap();
        if metadata.is_dir() {
            walk_dir(root_path_str, extensions, entry_path.to_str().unwrap())?
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
                        .strip_prefix(root_path_str)
                        .unwrap()
                        .to_str()
                        .unwrap(),
                ));
            }
        }
    }
    Ok(files)
}

#[allow(dead_code)]
pub fn relative_copy(from: &str, to: &str, extensions: &Vec<&str>, skip_check: bool) -> Result<()> {
    if !file_exist(from) {
        panic!("from not exist: {}", from);
    }

    let stat_from = fs::metadata(from).unwrap();
    if !stat_from.is_dir() {
        // copy file

        if skip_check || !file_equal(from, to).unwrap() {
            println!("copy file: {} -> {}", from, to);
            fs::create_dir_all(Path::new(to).parent().unwrap()).unwrap();
            fs::copy(from, to).unwrap();
        } else {
            println!("skip file: {}", from);
        }

        return Ok(());
    }

    // copy folder
    println!("copy files from: {}", from);
    println!("\tto: {}", to);
    println!("\textensions: {}", extensions.join(","));
    println!("");

    fs::create_dir_all(to).unwrap();

    let mut file_total = 0;
    let mut file_copied = 0;

    let dir_content = walk_dir(from, extensions, "").unwrap();

    for relative in dir_content {
        let relative = Path::new(relative.as_str());
        let src = Path::new(from).join(relative);
        let des = Path::new(to).join(relative);

        if skip_check || !file_equal(src.to_str().unwrap(), des.to_str().unwrap()).unwrap() {
            println!("\tcopied file: {}", relative.to_str().unwrap());
            fs::create_dir_all(des.parent().unwrap()).unwrap();
            fs::copy(src, des).unwrap();
            file_copied += 1;
        } else {
            // println!("build. skip copy equal config file: {}", relative);
        }
        file_total += 1;
    }

    println!(
        "total:  \t{}\tcopied: \t{}\tskipped:\t{}",
        file_total,
        file_copied,
        file_total - file_copied
    );
    println!("copy done.");
    println!("");
    Ok(())
}
