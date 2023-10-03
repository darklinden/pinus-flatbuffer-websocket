#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPT_DIR="$(realpath "${BASEDIR}")"

# Yes to continue
echo "即将："
echo "\t - 重新生成 jwt 证书"
read -p "请确认继续 (Yes/[default: Yes]): " Confirm
Confirm=${Confirm:-Yes}

if [ $Confirm != "Yes" ]; then
    echo "用户取消操作"
    exit 0
fi

KEYS_FOLDER=$SCRIPT_DIR/keys

# backup if exist
if [ -d "$KEYS_FOLDER" ]; then
    DATE=$(date +%Y%m%d%H%M%S)
    BACKUP_FOLDER=$KEYS_FOLDER"_"$DATE
    echo "检测到 $KEYS_FOLDER 已存在，将备份到 $BACKUP_FOLDER"
    mv $KEYS_FOLDER $BACKUP_FOLDER
fi

mkdir -p $KEYS_FOLDER

cd $KEYS_FOLDER
openssl ecparam -genkey -name prime256v1 -noout -out jwtES256.key
openssl ec -in jwtES256.key -pubout >jwtES256.pub
openssl pkcs8 -topk8 -nocrypt -in jwtES256.key -out jwtES256.pkcs8.pem

echo "jwt 证书生成完毕"

echo "将证书拷贝到项目中"
cp -rf $SCRIPT_DIR/keys $SCRIPT_DIR/../rust-http/
cp -rf $SCRIPT_DIR/keys $SCRIPT_DIR/../pinus-ws/
