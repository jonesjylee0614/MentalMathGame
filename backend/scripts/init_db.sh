#!/bin/bash

# Mental Math Game 数据库初始化脚本

# 颜色定义
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASS=""
DB_NAME="mental_math_game"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 检查MySQL是否可用
check_mysql() {
    print_info "检查MySQL连接..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_error "无法连接到MySQL，请检查配置"
        exit 1
    fi
    print_info "MySQL连接成功"
}

# 创建数据库
create_database() {
    print_info "创建数据库 $DB_NAME..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if [ $? -eq 0 ]; then
        print_info "数据库创建成功"
    else
        print_error "数据库创建失败"
        exit 1
    fi
}

# 执行迁移
run_migrations() {
    print_info "执行数据库迁移..."
    
    # 建表
    print_info "执行建表SQL..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < ../migrations/000001_init_schema.up.sql
    if [ $? -eq 0 ]; then
        print_info "建表完成"
    else
        print_error "建表失败"
        exit 1
    fi
    
    # 初始化数据
    print_info "执行初始化数据SQL..."
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < ../migrations/000002_init_data.up.sql
    if [ $? -eq 0 ]; then
        print_info "数据初始化完成"
    else
        print_error "数据初始化失败"
        exit 1
    fi
}

# 验证数据
verify_data() {
    print_info "验证数据..."
    
    # 检查表数量
    table_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" | wc -l)
    if [ $table_count -ge 10 ]; then
        print_info "表数量正常（$table_count 张表）"
    else
        print_warn "表数量异常（$table_count 张表）"
    fi
    
    # 检查关卡数量
    level_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT COUNT(*) FROM levels;" | tail -n 1)
    print_info "关卡数量：$level_count"
    
    # 检查成就数量
    achievement_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT COUNT(*) FROM achievements;" | tail -n 1)
    print_info "成就数量：$achievement_count"
}

# 主流程
main() {
    echo "========================================"
    echo "  Mental Math Game 数据库初始化"
    echo "========================================"
    echo ""
    
    # 提示用户输入密码
    read -s -p "请输入MySQL root密码: " DB_PASS
    echo ""
    echo ""
    
    check_mysql
    create_database
    run_migrations
    verify_data
    
    echo ""
    print_info "数据库初始化完成！"
    echo ""
    print_info "默认管理员账号："
    echo "  用户名: admin"
    echo "  密码: Admin123!"
    echo ""
    print_warn "请及时修改管理员密码！"
}

main

