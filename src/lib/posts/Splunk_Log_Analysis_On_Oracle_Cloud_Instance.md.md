---
title: "Splunk Setup On Oracle Cloud Instance"
date: "2025-11-25"
updated: "2025-11-25"
categories:
  - "cloud"
  - "oracle"
  - "lab"
  - "beginner"
coverImage: "/blogImages/blog1/Oracle-Cloud-Logo.png"
coverWidth: 8
coverHeight: 4
excerpt: November 25, 2025
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

*"You realize that you can just do things right? Like you can just do them. Just do things"* 

Me:
![ok](/static/blogImages/blog1/saitama_ok.jpg)

Since I don't know anything about Oracle and Splunk. let's learn and create a project around them. Let's do it. 

### Introduction
While my [personal homelab](https://github.com/hiCozyty/homelab) is still a work in progress, I'm not confident in its network security setup to host a vulnerable machine in my (even DMZ isolated) VLAN. I just don't feel comfortable.

So we turn to either AWS or Oracle Cloud who offer free plans. Since I'm already using AWS, Oracle it is. I know Azure also offer a generous plan, but I'm saving that for Windows stuff later down the road.  

For capturing potential sniffing or attacks, Oracle Cloud Infrastructure (OCI) provides an [in-house solution](https://blogs.oracle.com/observability/la-demystifying-agent-om-oci) called `OCI Observability and Management`, in which monitoring agents are deployed. The logs that are then automatically captured in the OCI log storage. 

When considering the data ingestion limit of splunk free tier at 500MB/day and OCI log storage limit of 10GB/month, OCI log storage is the bottleneck here. 

To maximize the theoretical log output for analysis, I will be opting out of the OCI ecosystem and handle the log storage on my own. 

<Callout>
Oracle Cloud offers two 1 CPU / 1GB RAM x86 based instances for free. 

There is an arm based instance in which you can opt for 4 CPU and 24GB RAM. And you can run a single arm instance under the free tier.

For issues with provisioning the arm based instance due to saturation, go to billing and upgrade to the `Pay as you go` model to bypass the API limits. 

This instance can remain free afterwards.
</Callout>

## Objectives
The endgoal for me is to produce a minimum working lab with secure logging attached where I can add more features to the log producing machine in the future based on my needs.

* First I need to secure the machines in a way that, if the lab VM is compromised, my trusted device is protected. 

* When considering Splunk free tier's daily data ingestion limit, I would need to implement some sort of network rate limiter or debouncer in the lab machine.

* The jump server, which will allow me to access the lab VM securely, will also serve as a data storage server. It has a storage limit of around 50GB. I will implement an automatic data pruner. 

* I will need to implement some sort of data ingestion mechanism from the trusted device side. I'm leaning towards manual ingestion because I don't usually leave the machine on all day. I will figure this out when I get there.

* For log forwarding from lab to jump server to my trusted device, I will use rsyslog and Splunk universal forwarder. 


## Planned Topology
![topology](/static/blogImages/blog1/oracle_lab.jpg)
*created with draw.io*
## Technologies Being leveraged

* Oracle Cloud Instances (running AlmaLinux for both)
* Splunk / Splunk universal forwarder
* rsyslog
* tailscale ACL

## Tailscale
For this project, I'm using my throwaway account.
![acl](/static/blogImages/blog1/acl.jpg)
For quick sanity check, I spun up a python http server from splunk then tred to `wget` from either the jump server or the lab. It didn't work. Great.
```
python3 -m http.server 8000
```

## Oracle Cloud Initial Configuration
Let's look at the official tailscale [documentation](https://tailscale.com/kb/1149/cloud-oracle) for accessing Oracle Cloud VMs privately using tailscale.
Setup the ingress rules to allow `UDP port 41641`. 

Then set to both jump server and lab:
```
tailscale set --ssh --advertise-routes=10.0.0.0/24,169.254.169.254/32 --accept-dns=false
```
Then add Oracle DNS nameserver in the tailscale dashboard and approve the subnets.

<Callout>
For legal reasons, we will set the egress rule to DENY everything (with the exception of tailscale UDP and ICMP) inside the lab VM. Splunk learning is mostly parsing the initial point of contact logs.

Post-compromise activity is cool and interesting, but I believe they are for more out of scope topics like threat intelligence and incident response.
</Callout>

## ssh logs 
For this starter project, I will focus only on `/var/log/secure`, which hold ssh related logs. The next project will try to get other logs from sources such as intrusion detection systems, databases, web servers, etc. 

Almalinux default rsyslog archive rate is every 7 days with a retention policy of 30 days. The plan is to change the archive rate for `/var/log/secure` to daily so I can properly monitor the daily log size to be under the 500MB limit. Then, implement an ingress traffic blocker using the [OCI CLI](https://github.com/oracle/oci-cli). 

What is rsyslog? It is a daemon that created the `/var/log/secure` directory and writes to it.

```
sudo nano /etc/logrotate.d/secure-daily

#Add this content:
/var/log/secure
{
    daily
    rotate 30
    missingok
    notifempty
    compress
    delaycompress
    sharedscripts
    postrotate
        /usr/bin/systemctl reload rsyslog.service >/dev/null 2>&1 || true
    endscript
}

# Remove `/var/log/secure` from the list, so it looks like:
/var/log/cron
/var/log/maillog
/var/log/messages
/var/log/spooler
{
    missingok
    sharedscripts
    postrotate
        /usr/bin/systemctl reload rsyslog.service >/dev/null 2>&1 || true
    endscript
}
#check for syntax errors
sudo logrotate -d /etc/logrotate.d/secure-daily

#force a rotation to test (actually rotates the file)
sudo logrotate -f /etc/logrotate.d/secure-daily

#verify it worked
ls -lh /var/log/secure*

```

## Configuring OCI CLI And Creating A Cronjob Log Size Watcher
OCI provides a CLI tool SDK wrapper for managing ingress and egress rules directly from the machine. I will leverage this tool to create a watcher program that monitors the size of the log directory of interests (ssh for now) and automatically deny all network ingress traffic if the log size exceeds the daily threshold (500MB). 

Since I updated the data archive rate to daily earlier, once the log size resets, the watcher will automatically restore the ingress rule to allow traffic again. 

```
# Install OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configure with your credentials using OCID, Tenancy OCID, region, and API key (generate in OCI Console → User Settings → API Keys)
oci setup config

# List your VCN
oci network vcn list --compartment-id <my-compartment-ocid>

# List security lists for your VCN
oci network security-list list --compartment-id <my-compartment-ocid> --vcn-id <my-vcn-ocid>

# Save your security list OCID for the below script
```
Create a monitoring script with OCI cli
```
sudo nano /usr/local/bin/log-size-monitor.sh
```
```
#!/bin/bash

# Configuration
MAX_SIZE_MB=500
MAX_SIZE_BYTES=$((MAX_SIZE_MB * 1024 * 1024))
ALERT_FILE="/var/log/log-size-alert"
LOCKFILE="/var/run/network-blocked.lock"

# OCI Configuration
SECURITY_LIST_OCID="ocid1.securitylist.oc1...." # YOUR SECURITY LIST OCID HERE
BACKUP_RULES_FILE="/var/log/oci-original-rules.json"

# Array of log files to monitor
LOG_FILES=(
    "/var/log/secure"
    # "/var/log/suricata/eve.json"
    # "/var/log/httpd/access_log"
)

# Calculate total size
TOTAL_SIZE=0
for LOG_FILE in "${LOG_FILES[@]}"; do
    if [ -f "$LOG_FILE" ]; then
        FILE_SIZE=$(stat -c%s "$LOG_FILE" 2>/dev/null)
        TOTAL_SIZE=$((TOTAL_SIZE + FILE_SIZE))
    fi
done

TOTAL_SIZE_MB=$((TOTAL_SIZE / 1024 / 1024))

# Check if currently blocked
if [ -f "$LOCKFILE" ]; then
    # We're blocked - check if we can restore
    if [ "$TOTAL_SIZE" -lt "$MAX_SIZE_BYTES" ]; then
        echo "$(date): Log size back to normal (${TOTAL_SIZE_MB}MB), restoring network..." >> "$ALERT_FILE"
        
        # Restore original ingress rules from backup
        if [ -f "$BACKUP_RULES_FILE" ]; then
            ORIGINAL_RULES=$(cat "$BACKUP_RULES_FILE")
            
            oci network security-list update \
              --security-list-id "$SECURITY_LIST_OCID" \
              --ingress-security-rules "$ORIGINAL_RULES" \
              --force >> "$ALERT_FILE" 2>&1
            
            if [ $? -eq 0 ]; then
                rm -f "$LOCKFILE"
                rm -f "$BACKUP_RULES_FILE"
                echo "$(date): Network restored via OCI" >> "$ALERT_FILE"
            else
                echo "$(date): ERROR: Failed to restore network rules" >> "$ALERT_FILE"
            fi
        else
            echo "$(date): ERROR: Backup rules file not found" >> "$ALERT_FILE"
        fi
    fi
else
    # Not blocked - check if we should block
    if [ "$TOTAL_SIZE" -ge "$MAX_SIZE_BYTES" ]; then
        echo "$(date): Combined log size exceeded ${MAX_SIZE_MB}MB (current: ${TOTAL_SIZE_MB}MB)" >> "$ALERT_FILE"
        
        # List individual file sizes
        echo "$(date): Individual file sizes:" >> "$ALERT_FILE"
        for LOG_FILE in "${LOG_FILES[@]}"; do
            if [ -f "$LOG_FILE" ]; then
                SIZE=$(stat -c%s "$LOG_FILE" 2>/dev/null)
                SIZE_MB=$((SIZE / 1024 / 1024))
                echo "  $LOG_FILE: ${SIZE_MB}MB" >> "$ALERT_FILE"
            fi
        done
        
        # Backup current ingress rules
        oci network security-list get \
          --security-list-id "$SECURITY_LIST_OCID" \
          --query 'data."ingress-security-rules"' \
          > "$BACKUP_RULES_FILE" 2>> "$ALERT_FILE"
        
        # Block all ingress traffic (except Tailscale if you want to keep access)
        # Option A: Block everything
        BLOCK_RULES='[{"source":"0.0.0.0/0","protocol":"all","isStateless":true,"description":"AUTO-BLOCK: Log limit exceeded"}]'
        
        # Option B: Block everything except Tailscale (recommended)
        # BLOCK_RULES='[{"source":"0.0.0.0/0","protocol":"all","isStateless":true,"tcpOptions":null,"udpOptions":null,"description":"AUTO-BLOCK"},{"source":"0.0.0.0/0","protocol":"17","isStateless":false,"udpOptions":{"destinationPortRange":{"min":41641,"max":41641}},"description":"Keep Tailscale"}]'
        
        oci network security-list update \
          --security-list-id "$SECURITY_LIST_OCID" \
          --ingress-security-rules "$BLOCK_RULES" \
          --force >> "$ALERT_FILE" 2>&1
        
        if [ $? -eq 0 ]; then
            touch "$LOCKFILE"
            echo "$(date): Emergency network block activated via OCI" >> "$ALERT_FILE"
        else
            echo "$(date): ERROR: Failed to apply network block" >> "$ALERT_FILE"
        fi
    fi
fi
```

```
# make executable
sudo chmod +x /usr/local/bin/log-size-monitor.sh
```

The script runs as root via cron, so root needs access to OCI CLI config:
```
# If you configured OCI CLI as opc user
sudo mkdir -p /root/.oci
sudo cp ~/.oci/config /root/.oci/
sudo cp ~/.oci/oci_api_key.pem /root/.oci/
sudo chmod 600 /root/.oci/config /root/.oci/oci_api_key.pem
```

Let's test it
```
# Test OCI CLI works as root
sudo oci network security-list get --security-list-id <your-ocid>

# Test the script manually
sudo /usr/local/bin/log-size-monitor.sh

# Check for errors
cat /var/log/log-size-alert
```
Add to cronjob that watches the log file(s) every 1 minute

```
sudo crontab -e
* * * * * /usr/local/bin/log-size-monitor.sh
```

The cronjob should now handle automatic network restoration after every daily archive.

## Automated Log Data Pusher From Lab To Jumpserver With Pruning

## Splunk Universal Forwarder From Jumpserver To Splunk

## Resources
https://tailscale.com/kb/1149/cloud-oracle
