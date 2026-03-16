#!/bin/bash
# ---------------------------------------------------------
# O-229 SERVER FIREWALL (UFW) & FAIL2BAN SETUP SCRIPT 
# Target OS: Ubuntu/Debian VPS
# ---------------------------------------------------------

echo "🛡️ Démarrage de la configuration Firewall (UFW) et Fail2Ban..."

# 1. INSTALLATION & UPDATE
apt-get update
apt-get install -y ufw fail2ban iptables ipset unattended-upgrades apt-listchanges

# Enable automatic security updates
dpkg-reconfigure -plow unattended-upgrades

# 2. UFW FIREWALL CONFIGURATION 
echo "🧱 Configuration UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow specific ports
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP (Let's encrypt / Nginx)
ufw allow 443/tcp     # HTTPS

# Rate limit SSH (UFW built-in limit: 6 connections per 30 seconds)
ufw limit 22/tcp

# Enable Firewall
ufw --force enable

# 3. KERNEL HARDENING (NETWORK STACKS)
echo "🧠 Configuration Kernel Hardening (sysctl)..."
cat <<EOF > /etc/sysctl.d/99-o229-security.conf
# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore pseudo ICMP redirect messages
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Don't send redirect messages
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Prevent IP Spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Prevent SYN Flood
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Log martian packets
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
EOF
sysctl -p /etc/sysctl.d/99-o229-security.conf

# 4. SSH HARDENING
echo "🔑 Sécurisation SSH..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# 5. FAIL2BAN CONFIGURATION 
echo "🚫 Configuration Fail2Ban..."

# Création du fichier jail local
cat <<EOF > /etc/fail2ban/jail.local
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 3
bantime = 24h

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 48h

[laravel-login-bruteforce]
enabled = true
port = http,https
filter = laravel-login
logpath = /var/www/o-229/backend/storage/logs/laravel.log
maxretry = 5
bantime = 24h
EOF

# Filtre Laravel pour le statut d'erreur 401/403 ou message "Failed login"
cat <<EOF > /etc/fail2ban/filter.d/laravel-login.conf
[Definition]
failregex = ^.*Failed login attempt.*ip":"<HOST>".*$
ignoreregex = 
EOF

systemctl restart fail2ban
systemctl enable fail2ban

echo "🔒 Configuration de l'Audit Système..."
apt-get install -y auditd
systemctl enable auditd
systemctl start auditd

echo "✅ Sécurisation de l'infrastructure réseau terminée. RECO: Changez le port SSH si nécessaire."
