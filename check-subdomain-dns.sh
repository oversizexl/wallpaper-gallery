#!/bin/bash

# ========================================
# 子域名 DNS 配置验证脚本
# 检查 wallpaper.061129.xyz 的配置
# ========================================

echo "🌐 子域名 DNS 配置验证工具"
echo "=========================================="
echo ""

# 配置变量
SUBDOMAIN="wallpaper.061129.xyz"
EXPECTED_CNAME="it-nuanxinpro.github.io."
GITHUB_IPS=(
    "185.199.108.153"
    "185.199.109.153"
    "185.199.110.153"
    "185.199.111.153"
)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 dig 命令
if ! command -v dig &> /dev/null; then
    echo -e "${RED}❌ 错误: dig 命令未安装${NC}"
    echo "   macOS 已自带 dig 命令，无需安装"
    exit 1
fi

# ========================================
# 1. 检查子域名 CNAME 记录
# ========================================
echo "🔍 步骤 1/4: 检查子域名 CNAME 记录"
echo "   域名: $SUBDOMAIN"
echo ""

CNAME_RESULT=$(dig +short "$SUBDOMAIN" CNAME)

if [ -z "$CNAME_RESULT" ]; then
    echo -e "${RED}❌ 错误: 未找到 CNAME 记录${NC}"
    echo ""
    echo "📋 请在 Spaceship 后台添加以下记录："
    echo "   Type: CNAME"
    echo "   Name: wallpaper"
    echo "   Value: it-nuanxinpro.github.io."
    echo "   TTL: 3600"
    echo ""
    echo "⚠️  注意：Value 末尾必须有点 (.)"
    exit 1
fi

echo -e "${BLUE}当前 CNAME 记录:${NC} $CNAME_RESULT"

if [ "$CNAME_RESULT" = "$EXPECTED_CNAME" ]; then
    echo -e "${GREEN}✅ CNAME 配置正确！${NC}"
else
    echo -e "${YELLOW}⚠️  CNAME 记录不匹配${NC}"
    echo "   预期: $EXPECTED_CNAME"
    echo "   实际: $CNAME_RESULT"
    echo ""
    echo "   这可能会导致访问问题，建议检查配置"
fi

echo ""

# ========================================
# 2. 检查 CNAME 最终解析的 A 记录
# ========================================
echo "🔍 步骤 2/4: 检查最终解析的 IP 地址"
echo ""

A_RECORDS=$(dig +short "$SUBDOMAIN" A)

if [ -z "$A_RECORDS" ]; then
    echo -e "${RED}❌ 错误: 未解析到任何 IP 地址${NC}"
    echo "   可能原因："
    echo "   1. DNS 尚未传播完成，请等待 5-30 分钟"
    echo "   2. CNAME 目标配置错误"
    exit 1
fi

echo -e "${BLUE}解析到的 IP 地址:${NC}"
IFS=$'\n' read -d '' -r -a RESOLVED_IPS < <(echo "$A_RECORDS") || true

ALL_IPS_MATCH=true
for ip in "${RESOLVED_IPS[@]}"; do
    if [[ " ${GITHUB_IPS[*]} " =~ " ${ip} " ]]; then
        echo -e "   ${GREEN}✓${NC} $ip (GitHub Pages)"
    else
        echo -e "   ${YELLOW}⚠️${NC}  $ip (未知 IP)"
        ALL_IPS_MATCH=false
    fi
done

if [ "$ALL_IPS_MATCH" = true ]; then
    echo -e "${GREEN}✅ 所有 IP 地址均为 GitHub Pages 官方 IP${NC}"
else
    echo -e "${YELLOW}⚠️  部分 IP 地址不是 GitHub Pages 官方 IP${NC}"
fi

echo ""

# ========================================
# 3. 检查根域名 A 记录（参考）
# ========================================
echo "🔍 步骤 3/4: 检查根域名 A 记录（参考）"
echo ""

ROOT_DOMAIN="061129.xyz"
ROOT_A_RECORDS=$(dig +short "$ROOT_DOMAIN" A)

if [ -z "$ROOT_A_RECORDS" ]; then
    echo -e "${YELLOW}⚠️  根域名未配置 A 记录${NC}"
else
    echo -e "${BLUE}根域名 ($ROOT_DOMAIN) A 记录:${NC}"
    IFS=$'\n' read -d '' -r -a ROOT_IPS < <(echo "$ROOT_A_RECORDS") || true

    for ip in "${ROOT_IPS[@]}"; do
        if [[ " ${GITHUB_IPS[*]} " =~ " ${ip} " ]]; then
            echo -e "   ${GREEN}✓${NC} $ip"
        else
            echo -e "   ${YELLOW}⚠️${NC}  $ip"
        fi
    done
fi

echo ""

# ========================================
# 4. 测试 HTTPS 访问
# ========================================
echo "🔍 步骤 4/4: 测试 HTTPS 访问"
echo ""

if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}⏭️  跳过 HTTPS 测试（curl 未安装）${NC}"
else
    echo "🔐 尝试访问 https://$SUBDOMAIN ..."

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$SUBDOMAIN" --max-time 10 || echo "000")

    case $HTTP_STATUS in
        200)
            echo -e "${GREEN}✅ HTTPS 访问成功！(HTTP $HTTP_STATUS)${NC}"
            echo "   网站已正常部署"
            ;;
        000)
            echo -e "${YELLOW}⏳ 无法访问 (连接超时)${NC}"
            echo "   可能原因："
            echo "   1. DNS 尚未完全传播（等待 5-30 分钟）"
            echo "   2. GitHub Pages 尚未配置自定义域名"
            echo "   3. 网络连接问题"
            ;;
        404)
            echo -e "${YELLOW}⚠️  HTTP 404 Not Found${NC}"
            echo "   可能原因："
            echo "   1. GitHub Pages 尚未部署完成"
            echo "   2. CNAME 文件未推送到仓库"
            echo "   3. Custom domain 配置不正确"
            ;;
        *)
            echo -e "${YELLOW}⚠️  HTTP 状态码: $HTTP_STATUS${NC}"
            echo "   网站可能尚未完全部署"
            ;;
    esac

    # 检查证书
    echo ""
    echo "🔐 检查 SSL 证书..."
    CERT_INFO=$(echo | openssl s_client -servername "$SUBDOMAIN" -connect "$SUBDOMAIN:443" 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null || echo "")

    if [ -n "$CERT_INFO" ]; then
        if [[ "$CERT_INFO" == *"Let's Encrypt"* ]]; then
            echo -e "${GREEN}✅ SSL 证书由 Let's Encrypt 签发（GitHub Pages 默认）${NC}"
        else
            echo -e "${BLUE}ℹ️  证书信息:${NC}"
            echo "   $CERT_INFO"
        fi
    else
        echo -e "${YELLOW}⏳ 无法获取证书信息（可能尚未签发）${NC}"
    fi
fi

echo ""
echo "=========================================="
echo ""

# ========================================
# 总结报告
# ========================================
echo "📊 配置状态总结"
echo ""

CONFIG_COMPLETE=true

# CNAME 检查
if [ "$CNAME_RESULT" = "$EXPECTED_CNAME" ]; then
    echo -e "${GREEN}✓${NC} CNAME 记录配置正确"
else
    echo -e "${RED}✗${NC} CNAME 记录需要检查"
    CONFIG_COMPLETE=false
fi

# IP 检查
if [ "$ALL_IPS_MATCH" = true ]; then
    echo -e "${GREEN}✓${NC} IP 地址解析正确"
else
    echo -e "${YELLOW}⚠${NC} IP 地址解析异常"
    CONFIG_COMPLETE=false
fi

# HTTPS 检查
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} HTTPS 访问正常"
else
    echo -e "${YELLOW}⏳${NC} HTTPS 访问待验证"
    CONFIG_COMPLETE=false
fi

echo ""

if [ "$CONFIG_COMPLETE" = true ]; then
    echo -e "${GREEN}🎉 配置完全正确，网站已成功部署！${NC}"
    echo ""
    echo "🌐 访问地址: https://$SUBDOMAIN"
else
    echo -e "${YELLOW}⏳ 配置部分完成，请参考以下步骤：${NC}"
    echo ""
    echo "📋 下一步操作："
    echo ""
    echo "1️⃣  在 Spaceship 添加/检查 CNAME 记录："
    echo "   访问: https://www.spaceship.com/"
    echo "   Domains > 061129.xyz > DNS Records > Add Record"
    echo "   Type: CNAME"
    echo "   Name: wallpaper"
    echo "   Value: it-nuanxinpro.github.io.  ← 末尾有点"
    echo "   TTL: 3600"
    echo ""
    echo "2️⃣  在 GitHub Pages 配置自定义域名："
    echo "   访问: https://github.com/IT-NuanxinPro/wallpaper-gallery/settings/pages"
    echo "   Custom domain: wallpaper.061129.xyz"
    echo "   Enforce HTTPS: ✓"
    echo ""
    echo "3️⃣  确保 CNAME 文件已推送到仓库根目录"
    echo "   文件内容: wallpaper.061129.xyz"
    echo ""
    echo "4️⃣  等待 DNS 传播和部署完成（5-30 分钟）"
    echo "   然后重新运行此脚本验证"
fi

echo ""
echo "=========================================="
echo ""

# 全球 DNS 传播检查
echo "🌍 检查全球 DNS 传播状态"
echo "   访问以下网站查看详细传播情况:"
echo "   https://www.whatsmydns.net/#CNAME/$SUBDOMAIN"
echo ""

# GitHub Actions 检查
echo "🚀 检查部署状态"
echo "   访问 GitHub Actions 查看部署进度:"
echo "   https://github.com/IT-NuanxinPro/wallpaper-gallery/actions"
echo ""

echo "✨ 验证完成！"
